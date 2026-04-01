package middleware

import (
	"net/http"
	"os"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/gin-gonic/gin"
)

const APIHeaderKey = "X-API-Key"

// APIKeyAuthMiddleware returns a Gin middleware that checks for
// the presence of an API key in the request header.
// If the API key is missing or invalid, it
// responds with a 401 Unauthorized status.
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
