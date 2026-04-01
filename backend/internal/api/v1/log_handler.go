package v1

import (
	"net/http"
	"strconv"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/service"
	"github.com/gin-gonic/gin"
)

type LogHandler struct {
	logSvc service.LogService
}

// NewLogHandler creates a handler for log endpoints.
func NewLogHandler(logSvc service.LogService) *LogHandler {
	return &LogHandler{logSvc: logSvc}
}

// RegisterRoutes attaches log routes to router group.
func (h *LogHandler) RegisterRoutes(router *gin.RouterGroup) {
	router.GET("/logs", h.HandleGetLogs)
}

// HandleGetLogs returns logs filtered by actor, with pagination.
func (h *LogHandler) HandleGetLogs(c *gin.Context) {
	actor := c.DefaultQuery("actor", "")
	limit := parseIntOrDefault(c.Query("limit"), 20)
	offset := parseIntOrDefault(c.Query("offset"), 0)

	logs, err := h.logSvc.GetLogs(c.Request.Context(), actor, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, logs)
}

func parseIntOrDefault(s string, def int) int {
	if s == "" {
		return def
	}
	v, err := strconv.Atoi(s)
	if err != nil {
		return def
	}
	return v
}
