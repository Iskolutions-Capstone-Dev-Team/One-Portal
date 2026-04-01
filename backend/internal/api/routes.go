package api

import (
	v1 "github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/initializers"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/middleware"
	"github.com/gin-gonic/gin"
)

type Routes struct {
	LogHandler *v1.LogHandler
}

// NewRoutes creates a route container with all handlers.
func NewRoutes(handlers *initializers.Handlers) *Routes {
	return &Routes{
		LogHandler: handlers.Log,
	}
}

// Register registers all route groups on the given Gin engine.
func (r *Routes) Register(router *gin.Engine) {
	apiGroup := router.Group("/api")
	v1Group := apiGroup.Group("/v1")

	v1Group.Use(middleware.APIKeyAuthMiddleware)
	v1Group.GET("/logs", r.LogHandler.HandleGetLogs)
}
