package v1

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/middleware"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

const (
	TimeoutDuration = 10 * time.Second
)

type AuthHandler struct {
	logService  service.LogService
	authService service.AuthService
	userService service.UserService
}

var Client = &http.Client{
	Timeout: TimeoutDuration,
}

// NewAuthHandler creates a handler for authentication-related endpoints.
func NewAuthHandler(
	logService service.LogService,
	authService service.AuthService,
	userService service.UserService,
) *AuthHandler {
	return &AuthHandler{
		logService:  logService,
		authService: authService,
		userService: userService,
	}
}

// HandleAuthorization redirects the user to the IDP for authentication.
// @Summary      Redirect to IDP
// @Description  Redirects to the Identity Provider authorization endpoint.
// @Tags         Auth
// @Produce      json
// @Success      302  {string}  string  "Redirect to IDP"
// @Failure      500  {object}  dto.ErrorResponse
// @Router       /auth/authorize [get]
func (h *AuthHandler) HandleAuthorization(c *gin.Context) {
	authorizeURL := os.Getenv("IDP_AUTH_URL")
	resp, err := Client.Get(authorizeURL)
	if err != nil {
		log.Printf(
			"[HandleAuthorization] Failed to redirect: %v",
			err,
		)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{
				Error: "Authorization redirect failed",
			},
		)
		return
	}
	defer resp.Body.Close()
}

// HandleCallback handles the callback from the IDP after successful auth.
// @Summary      OIDC Callback
// @Description  Exchanges authorization code for tokens and sets cookie.
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        request body dto.CallbackRequest true "Authorization code"
// @Success      200 {object} map[string]string "Status ok"
// @Failure      400 {object} dto.ErrorResponse "Invalid payload"
// @Failure      401 {object} dto.ErrorResponse "Invalid token"
// @Failure      500 {object} dto.ErrorResponse "Internal server error"
// @Router       /auth/callback [post]
func (h *AuthHandler) HandleCallback(c *gin.Context) {
	var req dto.CallbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[HandleCallback] Failed to bind request: %v", err)
		c.JSON(
			http.StatusBadRequest,
			dto.ErrorResponse{
				Error: "Invalid request payload",
			},
		)
		return
	}

	payload, err := json.Marshal(dto.CallbackPayload{
		ClientID:     os.Getenv("VITE_CLIENT_ID"),
		ClientSecret: os.Getenv("VITE_CLIENT_SECRET"),
		Code:         req.Code,
	})
	if err != nil {
		log.Printf(
			"[HandleCallback] Failed to marshal payload: %v",
			err,
		)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{
				Error: "Failed to process callback",
			},
		)
		return
	}

	tokenURL := os.Getenv("IDP_TOKEN_URL")
	resp, err := Client.Post(
		tokenURL,
		"application/json",
		bytes.NewBuffer(payload),
	)
	if err != nil {
		log.Printf(
			"[HandleCallback] Token exchange error: %v",
			err,
		)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{
				Error: "Failed to process callback",
			},
		)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf(
			"[HandleCallback] Token endpoint status: %d",
			resp.StatusCode,
		)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{
				Error: "Failed to process callback",
			},
		)
		return
	}

	var tokenResp dto.TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		log.Printf(
			"[HandleCallback] Failed to decode token response: %v",
			err,
		)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{
				Error: "Failed to process callback",
			},
		)
		return
	}

	claims, err := middleware.ValidateAccessToken(tokenResp.AccessToken)
	if err != nil {
		log.Printf("[HandleCallback] Token Validation: %v", err)
		c.JSON(
			http.StatusUnauthorized,
			dto.ErrorResponse{Error: "Invalid token"},
		)
		return
	}

	sub, _ := claims["userId"].(string)
	userID, err := uuid.Parse(sub)
	if err != nil {
		log.Printf("[HandleCallback] Invalid user ID in token: %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "Invalid user identity"},
		)
		return
	}

	// Check for user with that ID
	ctx := c.Request.Context()
	_, err = h.userService.GetUserByID(ctx, userID)
	if err != nil {
		userinfoURL := os.Getenv("IDP_USERINFO_URL")
		req, _ := http.NewRequest("GET", userinfoURL, nil)
		bearer := "Bearer " + tokenResp.AccessToken
		req.Header.Set("Authorization", bearer)

		resp, err := Client.Do(req)
		if err != nil {
			log.Printf("[HandleCallback] Userinfo fetch: %v", err)
			c.JSON(
				http.StatusInternalServerError,
				dto.ErrorResponse{Error: "Auth error"},
			)
			return
		}
		defer resp.Body.Close()

		var me dto.MeResponse
		if err := json.NewDecoder(resp.Body).Decode(&me); err != nil {
			log.Printf("[HandleCallback] Userinfo decode: %v", err)
			c.JSON(
				http.StatusInternalServerError,
				dto.ErrorResponse{Error: "Auth error"},
			)
			return
		}

		if err := h.userService.CreateUserFromMe(ctx, me); err != nil {
			log.Printf("[HandleCallback] User creation: %v", err)
			c.JSON(
				http.StatusInternalServerError,
				dto.ErrorResponse{Error: "Database error"},
			)
			return
		}
	}

	// Add the id and refresh_token in the table
	rt := models.RefreshToken{
		Token:     tokenResp.RefreshToken,
		UserID:    userID[:],
		ExpiresAt: time.Now().Add(30 * 24 * time.Hour), // 30 days
	}
	if err := h.authService.CreateToken(ctx, rt); err != nil {
		log.Printf(
			"[HandleCallback] Failed to save refresh token: %v",
			err,
		)
		// Don't fail the whole login if RT fails? Usually we should.
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "Auth error"},
		)
		return
	}

	c.SetCookie(
		dto.AccessCookieName,
		tokenResp.AccessToken,
		tokenResp.ExpiresIn,
		"/",
		"",
		true,
		true,
	)

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// Logout handles the user logout by clearing the access token cookie,
// deleting the user's refresh token from the database, and notifying the IDP.
// @Summary      Logout User
// @Description  Clears the access cookie, deletes RTs, and notifies IDP.
// @Tags         Auth
// @Produce      json
// @Success      200 {object} map[string]string "Status logged out"
// @Router       /auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	// Attempt to delete refresh token if cookie exists
	tokenStr, _ := c.Cookie(dto.AccessCookieName)
	if tokenStr != "" {
		h.processTokenDeletion(c, tokenStr)
	}

	// Always clear the access token cookie
	c.SetCookie(dto.AccessCookieName, "", -1, "/", "", true, true)

	// Notify the Identity Provider about the logout
	url := h.notifyIDPLogout(c)

	c.JSON(http.StatusOK, gin.H{"url": url})
}

// HandleRefresh handles requesting new access and refresh tokens from the IDP.
// It uses the current access token's user ID to fetch the refresh token
// from our database and sends it to the IDP's refresh endpoint.
// @Summary      Refresh Session
// @Description  Rotates access/refresh tokens using the stored session.
// @Tags         Auth
// @Produce      json
// @Success      200 {object} map[string]string "Status refreshed"
// @Failure      401 {object} dto.ErrorResponse "Unauthorized"
// @Failure      500 {object} dto.ErrorResponse "Internal error"
// @Router       /auth/refresh [post]
func (h *AuthHandler) HandleRefresh(c *gin.Context) {
	// 1. Get user identity from access token cookie
	tokenStr, _ := c.Cookie(dto.AccessCookieName)
	if tokenStr == "" {
		log.Printf(
			"[HandleRefresh] Auth: no access token cookie",
		)
		c.JSON(
			http.StatusUnauthorized,
			dto.ErrorResponse{Error: "No token"},
		)
		return
	}

	token, _, err := new(jwt.Parser).ParseUnverified(
		tokenStr,
		jwt.MapClaims{},
	)
	if err != nil {
		log.Printf("[HandleRefresh] Token Parsing: %v", err)
		c.JSON(
			http.StatusUnauthorized,
			dto.ErrorResponse{Error: "invalid token"},
		)
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		log.Printf("[HandleRefresh] Claims Parsing: invalid map format")
		c.JSON(
			http.StatusUnauthorized,
			dto.ErrorResponse{Error: "invalid claims"},
		)
		return
	}

	sub, _ := claims["userId"].(string)
	id, err := uuid.Parse(sub)
	if err != nil {
		log.Printf("[HandleRefresh] Identity Extraction: %v", err)
		c.JSON(
			http.StatusUnauthorized,
			dto.ErrorResponse{Error: "user not found"},
		)
		return
	}

	// 2. Fetch existing refresh token from database
	ctx := c.Request.Context()
	oldRT, err := h.authService.GetTokenByUserID(ctx, id[:])
	if err != nil {
		log.Printf("[HandleRefresh] Token Fetch: %v", err)
		c.JSON(
			http.StatusUnauthorized,
			dto.ErrorResponse{Error: "no session"},
		)
		return
	}

	// 3. Request for new tokens from IDP
	refreshURL := os.Getenv("IDP_REFRESH_URL")
	payload, _ := json.Marshal(map[string]string{
		"grant_type":    "refresh_token",
		"refresh_token": oldRT.Token,
		"client_id":     os.Getenv("VITE_CLIENT_ID"),
		"client_secret": os.Getenv("VITE_CLIENT_SECRET"),
	})

	resp, err := Client.Post(
		refreshURL,
		"application/json",
		bytes.NewBuffer(payload),
	)
	if err != nil {
		log.Printf("[HandleRefresh] IDP Request: %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "failed"},
		)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("[HandleRefresh] IDP Status: %d", resp.StatusCode)
		c.JSON(
			http.StatusUnauthorized,
			dto.ErrorResponse{Error: "rotation failed"},
		)
		return
	}

	var tokenResp dto.TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		log.Printf("[HandleRefresh] Decode Response: %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "decode failed"},
		)
		return
	}

	// 4. Update access token cookie
	c.SetCookie(
		dto.AccessCookieName,
		tokenResp.AccessToken,
		tokenResp.ExpiresIn,
		"/",
		"",
		true,
		true,
	)

	// 5. Update database (Replace old RT with new RT)
	_ = h.authService.DeleteTokensByUserID(ctx, id[:])
	newRT := models.RefreshToken{
		Token:     tokenResp.RefreshToken,
		UserID:    id[:],
		ExpiresAt: time.Now().Add(30 * 24 * time.Hour), // 30 days
	}
	_ = h.authService.CreateToken(ctx, newRT)

	c.JSON(http.StatusOK, gin.H{"status": "refreshed"})
}

// processTokenDeletion extracts user ID from token and deletes their RTs.
func (h *AuthHandler) processTokenDeletion(c *gin.Context, tokenStr string) {
	token, _, err := new(jwt.Parser).ParseUnverified(
		tokenStr,
		jwt.MapClaims{},
	)
	if err != nil {
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return
	}

	sub, _ := claims["sub"].(string)
	id, err := uuid.Parse(sub)
	if err != nil {
		return
	}

	ctx := c.Request.Context()
	err = h.authService.DeleteTokensByUserID(ctx, id[:])
	if err != nil {
		log.Printf("[Logout] Delete Refresh Token: %v", err)
	}
}

// notifyIDPLogout sends a logout notification to the IDP.
func (h *AuthHandler) notifyIDPLogout(c *gin.Context) string {
	logoutURL := os.Getenv("IDP_LOGOUT_URL")
	clientID := os.Getenv("VITE_CLIENT_ID")
	if logoutURL == "" || clientID == "" {
		return ""
	}

	accessToken, _ := c.Cookie(dto.AccessCookieName)
	if accessToken == "" {
		return logoutURL
	}

	claims, err := middleware.ValidateAccessToken(accessToken)
	if err != nil {
		return logoutURL
	}

	userID, ok := claims["userId"].(string)
	if !ok {
		return logoutURL
	}

	return fmt.Sprintf(
		"%s?client_id=%s&user_id=%s",
		logoutURL,
		clientID,
		userID,
	)
}
