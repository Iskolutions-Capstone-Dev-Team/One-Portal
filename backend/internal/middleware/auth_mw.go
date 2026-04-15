package middleware

import (
	"crypto/rsa"
	"encoding/base64"
	"fmt"
	"math/big"
	"net/http"
	"os"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

const (
	// APIHeaderKey is the key for API-based authentication header.
	APIHeaderKey = "X-API-Key"
)

// GlobalJWKS stores the public keys fetched from the identity provider.
var GlobalJWKS []dto.JWK

// APIKeyAuthMiddleware returns a Gin middleware that checks for
// the presence of an API key in the request header.
func APIKeyAuthMiddleware(c *gin.Context) {
	validAPIKey := os.Getenv("VITE_BACKEND_API_KEY")
	apiKey := c.GetHeader(APIHeaderKey)
	if apiKey == "" || apiKey != validAPIKey {
		c.AbortWithStatusJSON(
			http.StatusUnauthorized,
			dto.ErrorResponse{Error: "Unauthorized"},
		)
		return
	}
	c.Next()
}

/**
 * ValidateAccessToken parses and validates a JWT access token using
 * the JWKS endpoint from the identity provider.
 */
func ValidateAccessToken(tokenStr string) (jwt.MapClaims, error) {
	if len(GlobalJWKS) == 0 {
		return nil, fmt.Errorf("global JWKS not initialized")
	}

	token, err := jwt.Parse(
		tokenStr,
		func(t *jwt.Token) (interface{}, error) {
			kid, _ := t.Header["kid"].(string)
			for _, key := range GlobalJWKS {
				if key.Kid == kid {
					nb, _ := base64.RawURLEncoding.DecodeString(key.N)
					eb, _ := base64.RawURLEncoding.DecodeString(key.E)
					ev := big.NewInt(0).SetBytes(eb).Int64()
					return &rsa.PublicKey{
						N: big.NewInt(0).SetBytes(nb),
						E: int(ev),
					}, nil
				}
			}
			return nil, fmt.Errorf("key not found")
		},
	)

	if err != nil || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, fmt.Errorf("invalid claims")
	}

	return claims, nil
}

// JWTAuthMiddleware checks the access token in a cookie or Authorization header.
func JWTAuthMiddleware(c *gin.Context) {
	tStr, err := c.Cookie(dto.AccessCookieName)
	if err != nil || tStr == "" {
		// Fallback to Authorization header for simulation/Swagger
		authHeader := c.GetHeader("Authorization")
		if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
			tStr = authHeader[7:]
		}
	}

	if tStr == "" {
		c.AbortWithStatusJSON(
			http.StatusUnauthorized,
			dto.ErrorResponse{Error: "Unauthorized or missing token"},
		)
		return
	}

	claims, err := ValidateAccessToken(tStr)
	if err != nil {
		c.AbortWithStatusJSON(
			http.StatusUnauthorized,
			dto.ErrorResponse{Error: "Invalid session"},
		)
		return
	}

	// Set claims in context for use in downstream handlers
	c.Set("claims", claims)
	c.Next()
}
