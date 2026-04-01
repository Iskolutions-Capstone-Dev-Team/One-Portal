package v1

import (
	"log"
	"net/http"
	"strconv"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
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

// HandleGetLogs returns logs filtered by actor, with pagination.
// @Summary Get logs
// @Description Returns log records filtered by actor substring, with pagination support.
// @Tags logs
// @Accept json
// @Produce json
// @Param actor query string false "Actor filter substring"
// @Param limit query int false "Result limit" default(20)
// @Param offset query int false "Result offset" default(0)
// @Success 200 {object} dto.LogListResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/logs [get]
func (h *LogHandler) HandleGetLogs(c *gin.Context) {
	actor := c.DefaultQuery("actor", "")
	limit := parseIntOrDefault(c.Query("limit"), 20)
	offset := parseIntOrDefault(c.Query("offset"), 0)

	logs, err := h.logSvc.GetLogs(c.Request.Context(), actor, limit, offset)
	if err != nil {
		log.Printf("[LogHandler] GetLogs error: %v", err)
		c.JSON(
			http.StatusInternalServerError,
			dto.ErrorResponse{Error: "Failed to retrieve logs"},
		)
		return
	}

	c.JSON(http.StatusOK, dto.LogListResponse{Logs: logs})
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
