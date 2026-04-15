package service

import (
	"context"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/repository"
	"github.com/google/uuid"
)

type UserService interface {
	CreateUser(ctx context.Context, user models.User) error
	CreateUserFromMe(ctx context.Context, me dto.MeResponse) error
	GetUserByID(ctx context.Context, id uuid.UUID) (models.User, error)
	UpdateUserName(ctx context.Context, id uuid.UUID, req dto.UpdateUserNameRequest) error
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

func (s *userService) CreateUserFromMe(
	ctx context.Context, 
	me dto.MeResponse,
) error {
	user := models.User{
		ID:         me.ID,
		Username:   me.Email,
		FirstName:  me.FirstName,
		MiddleName: me.MiddleName,
		LastName:   me.LastName,
		NameSuffix: me.NameSuffix,
		Email:      me.Email,
	}
	return s.repo.CreateUser(ctx, user)
}

func (s *userService) GetUserByID(
	ctx context.Context, 
	id uuid.UUID,
) (models.User, error) {
	return s.repo.GetUserByID(ctx, id)
}

func (s *userService) UpdateUserName(
	ctx context.Context, 
	id uuid.UUID, 
	req dto.UpdateUserNameRequest,
) error {
	user := models.User{
		FirstName:  req.FirstName,
		MiddleName: req.MiddleName,
		LastName:   req.LastName,
		NameSuffix: req.NameSuffix,
	}
	return s.repo.UpdateUser(ctx, id, user)
}
