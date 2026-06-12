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

	// CreateSession stores a new user session in the database.
	CreateSession(ctx context.Context, s models.Session) error
	// GetSession retrieves an active user session by session ID.
	GetSession(ctx context.Context, id string) (models.Session, error)
	// DeleteSession deletes a user session from the database.
	DeleteSession(ctx context.Context, id string) error
	// DeleteExpiredSessions purges expired user sessions.
	DeleteExpiredSessions(ctx context.Context, now time.Time) (int64, error)
	// UpdateSession updates the expiration time of an existing session.
	UpdateSession(ctx context.Context, id string, exp time.Time) error
}

type authService struct {
	repo        repository.AuthRepository
	sessionRepo repository.SessionRepository
}

// NewAuthService creates a new AuthService instance.
func NewAuthService(
	repo repository.AuthRepository,
	sessionRepo repository.SessionRepository,
) AuthService {
	return &authService{
		repo:        repo,
		sessionRepo: sessionRepo,
	}
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

func (s *authService) CreateSession(
	ctx context.Context,
	session models.Session,
) error {
	return s.sessionRepo.CreateSession(ctx, session)
}

func (s *authService) GetSession(
	ctx context.Context,
	id string,
) (models.Session, error) {
	return s.sessionRepo.GetSession(ctx, id)
}

func (s *authService) DeleteSession(
	ctx context.Context,
	id string,
) error {
	return s.sessionRepo.DeleteSession(ctx, id)
}

func (s *authService) DeleteExpiredSessions(
	ctx context.Context,
	now time.Time,
) (int64, error) {
	return s.sessionRepo.DeleteExpiredSessions(ctx, now)
}

func (s *authService) UpdateSession(
	ctx context.Context,
	id string,
	exp time.Time,
) error {
	return s.sessionRepo.UpdateSession(ctx, id, exp)
}
