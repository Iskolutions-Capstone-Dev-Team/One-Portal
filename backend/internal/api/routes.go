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
	MFA               *v1.MFAHandler
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
		MFA:               handlers.MFA,
		Announcement:      handlers.Announcement,
	}
}

// Register registers all route groups on the given Gin engine.
//
// Auth middleware is applied SURGICALLY per group — not globally —
// so that IDP-facing flows (auth, otp, password/forgot) remain
// completely open as required by the OAuth/OIDC handshake.
func (r *Routes) Register(router *gin.Engine) {
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	apiGroup := router.Group("/api")
	v1Group := apiGroup.Group("/v1")

	// --- Public endpoints (no auth) ---

	// Announcement: public read-only data, cached in Redis
	v1Group.GET("/announcement", r.Announcement.HandleGetAnnouncement)

	// Auth flow: MUST remain fully open.
	// These routes ARE the OIDC handshake — adding auth middleware
	// here would break the login/refresh/logout cycle entirely.
	authGroup := v1Group.Group("/auth")
	authGroup.POST("/callback", r.AuthHandler.HandleCallback)
	authGroup.GET("/authorize", r.AuthHandler.HandleAuthorization)
	authGroup.POST("/logout", r.AuthHandler.Logout)
	authGroup.POST("/refresh", r.AuthHandler.HandleRefresh)
	authGroup.GET("/session", r.AuthHandler.HandleCheckSession)

	// OTP: called pre-login during account recovery — rate-limited only.
	otpGroup := v1Group.Group("/otp")
	otpRL := middleware.RateLimitMiddleware(middleware.OTPRateLimiter)
	otpGroup.POST("/send", otpRL, r.OTP.SendOTP)
	otpGroup.POST("/verify", otpRL, r.OTP.VerifyOTP)

	// MFA: called pre/post login during multi-factor auth setup/verification.
	mfaGroup := v1Group.Group("/mfa")
	mfaRL := middleware.RateLimitMiddleware(middleware.OTPRateLimiter)
	{
		mfaGroup.GET("/setup", mfaRL, r.MFA.GetTOTPSetup)
		mfaGroup.POST("/authenticators", mfaRL, r.MFA.PostAuthenticator)
		mfaGroup.POST("/verify", mfaRL, r.MFA.PostVerifyMFA)
		mfaGroup.GET(
			"/authenticators/list",
			mfaRL,
			r.MFA.GetAuthenticatorList,
		)
		mfaGroup.DELETE("/authenticators", mfaRL, r.MFA.DeleteAuthenticator)

		// Passkey verification
		mfaGroup.POST(
			"/passkey/verify/begin",
			mfaRL,
			r.MFA.BeginPasskeyVerification,
		)
		mfaGroup.POST(
			"/passkey/verify/finish",
			mfaRL,
			r.MFA.FinishPasskeyVerification,
		)
		mfaGroup.GET(
			"/passkey/exists",
			mfaRL,
			r.MFA.GetHasPasskey,
		)

		// Passkey registration
		mfaGroup.POST(
			"/passkey/register/begin",
			mfaRL,
			r.MFA.BeginPasskeyRegistration,
		)
		mfaGroup.POST(
			"/passkey/register/finish",
			mfaRL,
			r.MFA.FinishPasskeyRegistration,
		)
	}

	// --- JWT-protected endpoints (user session required) ---

	// User access dashboard: user is already logged in when viewing this.
	v1Group.GET(
		"/users/access",
		middleware.JWTAuthMiddleware,
		r.UserAccessHandler.GetUserDetailedAccess,
	)

	// Userinfo: already had JWT — no change.
	v1Group.GET(
		"/userinfo",
		middleware.JWTAuthMiddleware,
		r.UserHandler.HandleUserInfo,
	)

	userGroup := v1Group.Group("/user")
	{
		// Name change: authenticated user action.
		userGroup.PATCH(
			"/:id/name",
			middleware.JWTAuthMiddleware,
			r.UserHandler.PatchUserName,
		)
		// Password forgot: user is locked out — rate-limited only.
		// Intentionally unauthenticated; no token available.
		forgotRL := middleware.RateLimitMiddleware(middleware.OTPRateLimiter)
		userGroup.PATCH("/password/forgot", forgotRL,
			r.UserHandler.PatchUserPasswordByEmail,
		)
		// Password change: already had JWT — no change.
		userGroup.PATCH(
			"/password/change",
			middleware.JWTAuthMiddleware,
			r.UserHandler.PatchChangePassword,
		)
	}

	// --- API Key-protected endpoints (internal admin operations) ---

	// Logs: frontend uses it with X-API-Key + JWT (confirmed active usage).
	v1Group.GET(
		"/logs",
		middleware.APIKeyAuthMiddleware,
		middleware.JWTAuthMiddleware,
		r.LogHandler.HandleGetLogs,
	)

	// Clients: all operations require both API key (machine-to-machine)
	// AND a valid JWT (human operator). Double-layered because client
	// records contain sensitive OAuth credentials.
	clientsGroup := v1Group.Group(
		"/clients",
		middleware.APIKeyAuthMiddleware,
		middleware.JWTAuthMiddleware,
	)
	clientsGroup.GET("", r.ClientHandler.GetAllClients)
	clientsGroup.GET("/:id", r.ClientHandler.GetClientByID)
	clientsGroup.POST("", r.ClientHandler.CreateClient)
	clientsGroup.PUT("/:id", r.ClientHandler.UpdateClient)
	clientsGroup.DELETE("/:id", r.ClientHandler.DeleteClient)
}
