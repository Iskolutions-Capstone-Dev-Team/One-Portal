package initializers

import (
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/repository"
	"github.com/jmoiron/sqlx"
)

type Repositories struct {
	Log          repository.LogRepository
	RefreshToken repository.AuthRepository
	User         repository.UserRepository
}

// InitRepositories creates and returns all repository instances.
// Add new repositories here in future and expose them through Repositories.
func InitRepositories(db *sqlx.DB) *Repositories {
	return &Repositories{
		Log:          repository.NewLogRepository(db, 100),
		RefreshToken: repository.NewAuthRepository(db),
		User:         repository.NewUserRepository(db),
	}
}
