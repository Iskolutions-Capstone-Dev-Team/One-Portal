package v1

import (
	"encoding/json"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/cache"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/gin-gonic/gin"
)

const (
	// announcementCacheKey is the Redis key for cached announcement data.
	announcementCacheKey = "announcement:data"
	// announcementDefaultTTL is the fallback TTL when env var is absent.
	announcementDefaultTTL = 5 * time.Minute
)

type AnnouncementHandler struct {
	cache cache.Cache
}

// NewAnnouncementHandler creates an announcement handler.
// cache may be nil (cache is bypassed gracefully if unavailable).
func NewAnnouncementHandler(c cache.Cache) *AnnouncementHandler {
	return &AnnouncementHandler{cache: c}
}

// HandleGetAnnouncement fetches announcement data from an external URL.
// Responses are cached in Redis for the duration specified by the
// ANNOUNCEMENT_TTL environment variable (default 5 minutes).
// @Summary      Get Announcement
// @Description  Fetches current announcements from an external service.
// @Tags         Announcement
// @Accept       json
// @Produce      json
// @Success      200  {object}  interface{}
// @Failure      500  {object}  dto.ErrorResponse
// @Router       /announcement [get]
func (h *AnnouncementHandler) HandleGetAnnouncement(c *gin.Context) {
	ctx := c.Request.Context()

	// 1. Attempt cache hit
	if h.cache != nil {
		if cached, hit, err := h.cache.Get(ctx, announcementCacheKey); hit && err == nil {
			var data interface{}
			if json.Unmarshal([]byte(cached), &data) == nil {
				c.JSON(http.StatusOK, data)
				return
			}
		}
	}

	announcementURL := os.Getenv("ANNOUNCEMENT_URL")
	apiKey := os.Getenv("ANNOUNCEMENT_API_KEY")

	if announcementURL == "" {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "ANNOUNCEMENT_URL not configured",
		})
		return
	}

	req, err := http.NewRequest(http.MethodGet, announcementURL, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to build announcement request",
		})
		return
	}
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

	// 2. Populate cache before returning
	if h.cache != nil {
		if raw, err := json.Marshal(data); err == nil {
			ttl := parseTTL(os.Getenv("ANNOUNCEMENT_TTL"), announcementDefaultTTL)
			_ = h.cache.Set(ctx, announcementCacheKey, string(raw), ttl)
		}
	}

	c.JSON(http.StatusOK, data)
}

// parseTTL converts an env string like "300" to a time.Duration in
// seconds. Falls back to defaultTTL when the value is absent or invalid.
func parseTTL(s string, defaultTTL time.Duration) time.Duration {
	if s == "" {
		return defaultTTL
	}
	secs, err := strconv.Atoi(s)
	if err != nil || secs <= 0 {
		return defaultTTL
	}
	return time.Duration(secs) * time.Second
}
