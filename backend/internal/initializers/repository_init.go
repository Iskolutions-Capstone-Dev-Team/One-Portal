package initializers

import (
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/repository"
	"github.com/jmoiron/sqlx"
)

type Repositories struct {
	Log repository.LogRepository
}

// InitRepositories creates and returns all repository instances.
// Add new repositories here in future and expose them through Repositories.
func InitRepositories(db *sqlx.DB) *Repositories {
	return &Repositories{
		Log: repository.NewLogRepository(db, 100),
	}
}
