package v1

import (
	"bytes"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"os"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

const (
	TimeoutDuration = 10 * time.Second
	AccessCookieName = "access_token"
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
				Error: "Failed to redirect to authorization endpoint",
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
		log.Printf("[HandleCallback] Failed to marshal payload: %v", err)
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
			"[HandleCallback] Failed to exchange code for token: %v", 
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
			"[HandleCallback] Token endpoint returned non-OK status: %d",
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

	// Validate access token via IDP_JWKS_URL
	jwksURL := os.Getenv("IDP_JWKS_URL")
	jwksResp, err := Client.Get(jwksURL)
	if err != nil {
		log.Printf("[HandleCallback] Failed to fetch JWKS: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Auth error"})
		return
	}
	defer jwksResp.Body.Close()

	var jwks struct {
		Keys []dto.JWK `json:"keys"`
	}
	if err := json.NewDecoder(jwksResp.Body).Decode(&jwks); err != nil {
		log.Printf("[HandleCallback] Failed to decode JWKS: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Auth error"})
		return
	}

	token, err := jwt.Parse(tokenResp.AccessToken, func(token *jwt.Token) (interface{}, error) {
		kid, ok := token.Header["kid"].(string)
		if !ok {
			return nil, fmt.Errorf("missing kid")
		}

		for _, key := range jwks.Keys {
			if key.Kid == kid {
				nBytes, _ := base64.RawURLEncoding.DecodeString(key.N)
				eBytes, _ := base64.RawURLEncoding.DecodeString(key.E)
				e := big.NewInt(0).SetBytes(eBytes).Int64()
				return &rsa.PublicKey{
					N: big.NewInt(0).SetBytes(nBytes),
					E: int(e),
				}, nil
			}
		}
		return nil, fmt.Errorf("key not found")
	})

	if err != nil || !token.Valid {
		log.Printf("[HandleCallback] Invalid token: %v", err)
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Invalid token"})
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Invalid claims"})
		return
	}

	sub, _ := claims["sub"].(string)
	userID, err := uuid.Parse(sub)
	if err != nil {
		log.Printf("[HandleCallback] Invalid user ID in token: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Invalid user identity"})
		return
	}

	// Check for user with that ID
	ctx := c.Request.Context()
	user, err := h.userService.GetUserByID(ctx, userID)
	_ = user // user is currently unused but retrieved to check existence
	if err != nil {
		// If not exist, create one (Assumes err is row not found or similar)
		// For simplicity, we create if Get returns error. In prod check specific error.
		newUser := models.User{
			ID:       userID,
			Username: claims["preferred_username"].(string),
			Email:    claims["email"].(string),
		}
		if name, ok := claims["given_name"].(string); ok {
			newUser.FirstName = name
		}
		if name, ok := claims["family_name"].(string); ok {
			newUser.LastName = name
		}

		if err := h.userService.CreateUser(ctx, newUser); err != nil {
			log.Printf("[HandleCallback] Failed to create user: %v", err)
			c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Database error"})
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
		log.Printf("[HandleCallback] Failed to save refresh token: %v", err)
		// Don't fail the whole login if RT fails? Usually we should.
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Auth error"})
		return
	}

	c.SetCookie(
		AccessCookieName,
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
// @Description  Clears the access cookie, deletes refresh tokens, and notifies IDP.
// @Tags         Auth
// @Produce      json
// @Success      200 {object} map[string]string "Status logged out"
// @Router       /auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	// Attempt to delete refresh token if cookie exists
	if tokenStr, _ := c.Cookie(AccessCookieName); tokenStr != "" {
		h.processTokenDeletion(c, tokenStr)
	}

	// Always clear the access token cookie
	c.SetCookie(AccessCookieName, "", -1, "/", "", true, true)

	// Notify the Identity Provider about the logout
	h.notifyIDPLogout()

	c.JSON(http.StatusOK, gin.H{"status": "logged out"})
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
	tokenStr, _ := c.Cookie(AccessCookieName)
	if tokenStr == "" {
		log.Printf("[HandleRefresh] Authentication: no access token cookie")
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "No token"})
		return
	}

	token, _, err := new(jwt.Parser).ParseUnverified(
		tokenStr,
		jwt.MapClaims{},
	)
	if err != nil {
		log.Printf("[HandleRefresh] Token Parsing: %v", err)
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "invalid token"})
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

	sub, _ := claims["sub"].(string)
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
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "no session"})
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
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "failed"})
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
		AccessCookieName,
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
func (h *AuthHandler) notifyIDPLogout() {
	logoutURL := os.Getenv("IDP_LOGOUT_URL")
	clientID := os.Getenv("VITE_CLIENT_ID")
	if logoutURL == "" || clientID == "" {
		return
	}

	payload, _ := json.Marshal(map[string]string{
		"client_id": clientID,
	})
	_, err := Client.Post(
		logoutURL,
		"application/json",
		bytes.NewBuffer(payload),
	)
	if err != nil {
		log.Printf("[Logout] IDP Logout Request: %v", err)
	}
}

