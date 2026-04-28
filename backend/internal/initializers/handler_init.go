package initializers

import (
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/api/v1"
)

type Handlers struct {
	Log          *v1.LogHandler
	Auth         *v1.AuthHandler
	Client       *v1.ClientHandler
	User         *v1.UserHandler
	UserAccess   *v1.UserAccessHandler
	OTP          *v1.OTPHandler
	Announcement *v1.AnnouncementHandler
}

// InitHandlers creates and returns all handler instances based on services.
// Add new handlers here in future and expose via Handlers.
func InitHandlers(services *Services) *Handlers {
	return &Handlers{
		Log:          v1.NewLogHandler(services.Log),
		Auth:         v1.NewAuthHandler(services.Log, services.RefreshToken, services.User),
		User:         v1.NewUserHandler(services.User),
		Client:       v1.NewClientHandler(services.Client),
		UserAccess:   v1.NewUserAccessHandler(),
		OTP:          v1.NewOTPHandler(),
		Announcement: v1.NewAnnouncementHandler(),
	}
}
