package v1

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/gin-gonic/gin"
)

type AnnouncementHandler struct{}

func NewAnnouncementHandler() *AnnouncementHandler {
	return &AnnouncementHandler{}
}

// HandleGetAnnouncement fetches announcement data from an external URL.
// @Summary      Get Announcement
// @Description  Fetches current announcements from an external service using an API key.
// @Tags         Announcement
// @Accept       json
// @Produce      json
// @Success      200  {object}  interface{}
// @Failure      500  {object}  dto.ErrorResponse
// @Router       /announcement [get]
func (h *AnnouncementHandler) HandleGetAnnouncement(c *gin.Context) {
	announcementURL := os.Getenv("ANNOUNCEMENT_URL")
	apiKey := os.Getenv("ANNOUNCEMENT_API_KEY")

	if announcementURL == "" {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "ANNOUNCEMENT_URL not configured",
		})
		return
	}

	req, _ := http.NewRequest(http.MethodGet, announcementURL, nil)
	req.Header.Set("X-API-Key", apiKey)

	resp, err := Client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to fetch announcements",
		})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		c.JSON(resp.StatusCode, dto.ErrorResponse{
			Error: "Announcement service returned error",
		})
		return
	}

	var data interface{}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to decode announcement response",
		})
		return
	}

	c.JSON(http.StatusOK, data)
}
