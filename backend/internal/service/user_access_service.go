package service

import (
	"context"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/repository"
	"github.com/google/uuid"
)

type UserAccessService interface {
	GrantAccess(ctx context.Context, userID, clientID uuid.UUID) error
	RevokeAccess(ctx context.Context, userID, clientID uuid.UUID) error
	GetUserAccesses(ctx context.Context, userID uuid.UUID) ([]models.UserAccess, error)
	GetClientAccesses(ctx context.Context, clientID uuid.UUID) ([]models.UserAccess, error)
	HasAccess(ctx context.Context, userID, clientID uuid.UUID) (bool, error)
}

type userAccessService struct {
	repo repository.UserAccessRepository
}

func NewUserAccessService(repo repository.UserAccessRepository) UserAccessService {
	return &userAccessService{repo: repo}
}

func (s *userAccessService) GrantAccess(
	ctx context.Context,
	userID, clientID uuid.UUID,
) error {
	access := models.UserAccess{
		UserID:   userID,
		ClientID: clientID,
	}
	return s.repo.GrantAccess(ctx, access)
}

func (s *userAccessService) RevokeAccess(
	ctx context.Context,
	userID, clientID uuid.UUID,
) error {
	return s.repo.RevokeAccess(ctx, userID, clientID)
}

func (s *userAccessService) GetUserAccesses(
	ctx context.Context,
	userID uuid.UUID,
) ([]models.UserAccess, error) {
	return s.repo.GetAccessByUserID(ctx, userID)
}

func (s *userAccessService) GetClientAccesses(
	ctx context.Context,
	clientID uuid.UUID,
) ([]models.UserAccess, error) {
	return s.repo.GetAccessByClientID(ctx, clientID)
}

func (s *userAccessService) HasAccess(
	ctx context.Context,
	userID, clientID uuid.UUID,
) (bool, error) {
	return s.repo.CheckAccess(ctx, userID, clientID)
}
