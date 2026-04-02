package service

import (
	"context"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/repository"
	"github.com/google/uuid"
)

type UserService interface {
	CreateUser(ctx context.Context, user models.User) error
	GetUserByID(ctx context.Context, id uuid.UUID) (models.User, error)
}

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
}

func (s *userService) CreateUser(ctx context.Context, user models.User) error {
	return s.repo.CreateUser(ctx, user)
}

func (s *userService) GetUserByID(
	ctx context.Context, 
	id uuid.UUID,
) (models.User, error) {
	return s.repo.GetUserByID(ctx, id)
}
