package api

import (
	v1 "github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/service"
	"github.com/gin-gonic/gin"
)

type Routes struct {
	LogHandler *v1.LogHandler
}

// NewRoutes creates a route container with all handlers.
func NewRoutes(logSvc service.LogService) *Routes {
	return &Routes{
		LogHandler: v1.NewLogHandler(logSvc),
	}
}

// Register registers all route groups on the given Gin engine.
func (r *Routes) Register(router *gin.Engine) {
	apiGroup := router.Group("/api")
	v1Group := apiGroup.Group("/v1")

	r.LogHandler.RegisterRoutes(v1Group)
}
