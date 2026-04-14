package v1

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/gin-gonic/gin"
)

type UserAccessHandler struct{}

func NewUserAccessHandler() *UserAccessHandler {
	return &UserAccessHandler{}
}

// GetUserDetailedAccess proxies the request to the Identity-Provider to fetch
// detailed user access information.
func (h *UserAccessHandler) GetUserDetailedAccess(c *gin.Context) {
	// 1. Get access_token from cookie
	accessToken, err := c.Cookie("access_token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Access token not found in cookies",
		})
		return
	}

	// 2. Fetch external API details from environment
	idpURL := os.Getenv("IDP_ACCESS_URL")
	apiKey := os.Getenv("VITE_BACKEND_API_KEY")

	if idpURL == "" || apiKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Identity Provider configuration missing",
		})
		return
	}

	// 3. Prepare the proxy request to Identity-Provider
	req, err := http.NewRequest("GET", idpURL, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create proxy request",
		})
		return
	}

	// 4. Pass along the required authentication headers
	req.Header.Set("X-API-Key", apiKey)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))

	// 5. Execute proxy call
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{
			"error": "Failed to reach Identity Provider",
		})
		return
	}
	defer resp.Body.Close()

	// 6. Decode and proxy the response back to the client
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

	c.JSON(http.StatusOK, accessInfo)
}
