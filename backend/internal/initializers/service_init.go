package initializers

import (
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/service"
)

type Services struct {
	Log service.LogService
}

// InitServices creates and returns all service instances based on repositories.
// Add new services here in future and expose them through Services.
func InitServices(repos *Repositories) *Services {
	return &Services{
		Log: service.NewLogService(repos.Log),
	}
}
