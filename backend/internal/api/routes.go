package api

import (
	_ "github.com/Iskolutions-Capstone-Dev-Team/One-Portal/docs"
	v1 "github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/initializers"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/middleware"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

type Routes struct {
	LogHandler        *v1.LogHandler
	AuthHandler       *v1.AuthHandler
	ClientHandler     *v1.ClientHandler
	UserAccessHandler *v1.UserAccessHandler
	UserHandler       *v1.UserHandler
	OTP               *v1.OTPHandler
	Announcement      *v1.AnnouncementHandler
}

// NewRoutes creates a route container with all handlers.
func NewRoutes(handlers *initializers.Handlers) *Routes {
	return &Routes{
		LogHandler:        handlers.Log,
		AuthHandler:       handlers.Auth,
		ClientHandler:     handlers.Client,
		UserAccessHandler: handlers.UserAccess,
		UserHandler:       handlers.User,
		OTP:               handlers.OTP,
		Announcement:      handlers.Announcement,
	}
}

// Register registers all route groups on the given Gin engine.
func (r *Routes) Register(router *gin.Engine) {
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	apiGroup := router.Group("/api")
	v1Group := apiGroup.Group("/v1")

	v1Group.GET("/logs", r.LogHandler.HandleGetLogs)
	v1Group.GET("/announcement", r.Announcement.HandleGetAnnouncement)

	authGroup := v1Group.Group("/auth")
	authGroup.POST("/callback", r.AuthHandler.HandleCallback)
	authGroup.GET("/authorize", r.AuthHandler.HandleAuthorization)
	authGroup.POST("/logout", r.AuthHandler.Logout)
	authGroup.POST("/refresh", r.AuthHandler.HandleRefresh)

	clientsGroup := v1Group.Group("/clients")
	clientsGroup.GET("", r.ClientHandler.GetAllClients)
	clientsGroup.GET("/:id", r.ClientHandler.GetClientByID)
	clientsGroup.POST("", r.ClientHandler.CreateClient)
	clientsGroup.PUT("/:id", r.ClientHandler.UpdateClient)
	clientsGroup.DELETE("/:id", r.ClientHandler.DeleteClient)

	v1Group.GET("/users/access", r.UserAccessHandler.GetUserDetailedAccess)
	v1Group.GET("/userinfo", middleware.JWTAuthMiddleware, r.UserHandler.HandleUserInfo)

	userGroup := v1Group.Group("/user")
	{
		userGroup.PATCH("/:id/name", r.UserHandler.PatchUserName)
		userGroup.PATCH("/password/forgot", r.UserHandler.PatchUserPasswordByEmail)
		userGroup.PATCH("/password/change", middleware.JWTAuthMiddleware, r.UserHandler.PatchChangePassword)
	}

	otpGroup := v1Group.Group("/otp")
	{
		otpGroup.POST("/send", r.OTP.SendOTP)
		otpGroup.POST("/verify", r.OTP.VerifyOTP)
	}
}
