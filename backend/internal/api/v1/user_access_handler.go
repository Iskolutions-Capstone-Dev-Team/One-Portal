package v1

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/cache"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

const (
	// userAccessTTL is how long user-access data is cached per user.
	// Short TTL to reflect permission changes in a reasonable window.
	userAccessTTL = 30 * time.Second
)

type UserAccessHandler struct {
	cache cache.Cache
}

// NewUserAccessHandler creates a handler for user access endpoints.
// cache may be nil (cache is bypassed gracefully if unavailable).
func NewUserAccessHandler(c cache.Cache) *UserAccessHandler {
	return &UserAccessHandler{cache: c}
}

// GetUserDetailedAccess proxies the request to the Identity-Provider
// to fetch detailed user access information. Results are cached in
// Redis per user for 30 seconds to reduce IDP load.
// @Summary      Get detailed user access
// @Description  Fetches detailed access information by proxying to the IDP.
// @Tags         User Access
// @Produce      json
// @Success      200  {array}   dto.ClientDetailedAccessResponse
// @Failure      401  {object}  dto.ErrorResponse
// @Failure      500  {object}  dto.ErrorResponse
// @Failure      502  {object}  dto.ErrorResponse
// @Security     BearerAuth
// @Router       /users/access [get]
func (h *UserAccessHandler) GetUserDetailedAccess(c *gin.Context) {
	// 1. Get access_token from cookie
	accessToken, err := c.Cookie("access_token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Access token not found in cookies",
		})
		return
	}

	// 2. Extract user ID from token for the cache key
	userID := extractUserIDFromToken(accessToken)
	cacheKey := fmt.Sprintf("user_access:%s", userID)
	ctx := c.Request.Context()

	// 3. Attempt cache hit (only when user ID was successfully extracted)
	if h.cache != nil && userID != "" {
		if cached, hit, err := h.cache.Get(ctx, cacheKey); hit && err == nil {
			var accessInfo []dto.ClientDetailedAccessResponse
			if json.Unmarshal([]byte(cached), &accessInfo) == nil {
				c.JSON(http.StatusOK, accessInfo)
				return
			}
		}
	}

	// 4. Fetch external API details from environment
	idpURL := os.Getenv("IDP_ACCESS_URL")
	apiKey := os.Getenv("VITE_BACKEND_API_KEY")

	if idpURL == "" || apiKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Identity Provider configuration missing",
		})
		return
	}

	// 5. Prepare the proxy request to Identity-Provider
	req, err := http.NewRequest("GET", idpURL, nil)
	if err != nil {
		log.Printf("[GetUserDetailedAccess] Build Request: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create proxy request",
		})
		return
	}

	// 6. Pass along the required authentication headers
	req.Header.Set("X-API-Key", apiKey)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))

	// 7. Execute proxy call — use shared Client for connection pooling
	resp, err := Client.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{
			"error": "Failed to reach Identity Provider",
		})
		return
	}
	defer resp.Body.Close()

	// 8. Decode and proxy the response back to the client
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to read Identity Provider response",
		})
		return
	}

	// If IDP returned an error, pass it along as is
	if resp.StatusCode != http.StatusOK {
		c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), body)
		return
	}

	var accessInfo []dto.ClientDetailedAccessResponse
	if err := json.Unmarshal(body, &accessInfo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to parse Identity Provider response",
		})
		return
	}

	// 9. Filter out One-Portal's own client from the list
	selfClientID := os.Getenv("CLIENT_ID")
	if selfClientID == "" {
		log.Printf(
			"[GetUserDetailedAccess] Config: CLIENT_ID env var not set,"+
				" skipping filter",
		)
		h.setCacheAndRespond(c, cacheKey, userID, accessInfo)
		return
	}

	filtered := make([]dto.ClientDetailedAccessResponse, 0, len(accessInfo))
	for _, entry := range accessInfo {
		if !strings.EqualFold(entry.ID, selfClientID) {
			filtered = append(filtered, entry)
		}
	}

	h.setCacheAndRespond(c, cacheKey, userID, filtered)
}

// setCacheAndRespond stores the result in Redis (if available) and
// writes the JSON response to the client.
func (h *UserAccessHandler) setCacheAndRespond(
	c *gin.Context,
	cacheKey, userID string,
	data []dto.ClientDetailedAccessResponse,
) {
	if h.cache != nil && userID != "" {
		if raw, err := json.Marshal(data); err == nil {
			ctx := c.Request.Context()
			_ = h.cache.Set(ctx, cacheKey, string(raw), userAccessTTL)
		}
	}
	c.JSON(http.StatusOK, data)
}

// extractUserIDFromToken parses the token without verification to
// extract the userId claim for use as a cache key. Verification has
// already been done upstream in JWTAuthMiddleware.
func extractUserIDFromToken(tokenStr string) string {
	token, _, err := new(jwt.Parser).ParseUnverified(
		tokenStr,
		jwt.MapClaims{},
	)
	if err != nil {
		return ""
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return ""
	}
	id, _ := claims["userId"].(string)
	return id
}
