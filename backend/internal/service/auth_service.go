package service

import (
	"context"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/repository"
)

type AuthService interface {
	CreateToken(ctx context.Context, token models.RefreshToken) error
	GetToken(ctx context.Context, token string) (models.RefreshToken, error)
	UpdateToken(ctx context.Context, token string, expiresAt time.Time) error
	DeleteToken(ctx context.Context, token string) error
	DeleteTokensByUserID(ctx context.Context, userID []byte) error
	GetTokenByUserID(ctx context.Context, userID []byte) (
		models.RefreshToken,
		error,
	)
	DeleteExpiredTokens(ctx context.Context, at time.Time) (int64, error)
}

type authService struct {
	repo repository.AuthRepository
}

func NewAuthService(repo repository.AuthRepository) AuthService {
	return &authService{repo: repo}
}

func (s *authService) CreateToken(
	ctx context.Context,
	token models.RefreshToken,
) error {
	return s.repo.CreateToken(ctx, token)
}

func (s *authService) GetToken(
	ctx context.Context,
	token string,
) (models.RefreshToken, error) {
	return s.repo.GetToken(ctx, token)
}

func (s *authService) UpdateToken(
	ctx context.Context,
	token string,
	expiresAt time.Time,
) error {
	return s.repo.UpdateToken(ctx, token, expiresAt)
}

func (s *authService) DeleteToken(
	ctx context.Context,
	token string,
) error {
	return s.repo.DeleteToken(ctx, token)
}

func (s *authService) DeleteTokensByUserID(
	ctx context.Context,
	userID []byte,
) error {
	return s.repo.DeleteTokensByUserID(ctx, userID)
}

func (s *authService) GetTokenByUserID(
	ctx context.Context,
	userID []byte,
) (models.RefreshToken, error) {
	return s.repo.GetTokenByUserID(ctx, userID)
}

func (s *authService) DeleteExpiredTokens(
	ctx context.Context,
	at time.Time,
) (int64, error) {
	return s.repo.DeleteExpiredTokens(ctx, at)
}
