package initializers

import (
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/service"
)

type Services struct {
	Log          service.LogService
	RefreshToken service.AuthService
	User         service.UserService
	Client       service.ClientService
	UserAccess   service.UserAccessService
}

// InitServices creates and returns all service instances based on repositories.
// Add new services here in future and expose them through Services.
func InitServices(repos *Repositories) *Services {
	return &Services{
		Log:          service.NewLogService(repos.Log),
		RefreshToken: service.NewAuthService(repos.RefreshToken),
		User:         service.NewUserService(repos.User),
		Client:       service.NewClientService(repos.Client, Storage),
		UserAccess:   service.NewUserAccessService(repos.UserAccess),
	}
}
