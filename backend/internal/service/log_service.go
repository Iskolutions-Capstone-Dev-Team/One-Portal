package service

import (
	"context"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/repository"
)

type LogService interface {
	// LogAction will record an action in the async log pipeline.
	//
	// It delegates to the repository layer for queueing. The call is
	// expected to return quickly and does not block DB writes.
	LogAction(ctx context.Context, actor, action string) error

	// GetLogs returns logs filtered by actor substring.
	//
	// This is synchronous and useful for admin/UI retrieval.
	GetLogs(
		ctx context.Context,
		actor string,
		limit, offset int,
	) ([]models.Log, error)
}

type logService struct {
	logRepo repository.LogRepository
}

// NewLogService creates a new LogService using the provided repo.
func NewLogService(logRepo repository.LogRepository) LogService {
	return &logService{logRepo: logRepo}
}

func (s *logService) LogAction(ctx context.Context,
	actor, action string,
) error {
	logEntry := models.Log{
		Actor:     actor,
		Action:    action,
		CreatedAt: time.Now(),
	}

	return s.logRepo.CreateLog(ctx, logEntry)
}

func (s *logService) GetLogs(ctx context.Context,
	actor string, limit, offset int,
) ([]models.Log, error) {
	return s.logRepo.GetLogs(ctx, actor, limit, offset)
}
