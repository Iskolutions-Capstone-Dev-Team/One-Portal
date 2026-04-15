package service

import (
	"context"
	"fmt"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/storage"
	"github.com/google/uuid"
)

type ClientService interface {
	CreateClient(ctx context.Context, req dto.ClientRequest) error
	GetClientByID(ctx context.Context, id uuid.UUID) (dto.ClientResponse, error)
	GetAllClients(ctx context.Context) ([]dto.ClientResponse, error)
	UpdateClient(ctx context.Context, req dto.ClientRequest) error
	DeleteClient(ctx context.Context, id uuid.UUID) error
	GetPresignedURL(ctx context.Context, object string) (string, error)
}

type clientService struct {
	repo    repository.ClientRepository
	storage *storage.S3Provider
}

func NewClientService(
	repo repository.ClientRepository,
	storage *storage.S3Provider,
) ClientService {
	return &clientService{
		repo:    repo,
		storage: storage,
	}
}

func (s *clientService) CreateClient(
	ctx context.Context,
	req dto.ClientRequest,
) error {
	client := models.Client{
		ID:            uuid.New(),
		ClientName:    req.ClientName,
		ClientSecret:  req.ClientSecret,
		BaseURL:       req.BaseURL,
		Description:   req.Description,
		ImageLocation: req.ImageLocation,
		OldSecret:     req.OldSecret,
	}
	return s.repo.CreateClient(ctx, client)
}

func (s *clientService) GetClientByID(
	ctx context.Context,
	id uuid.UUID,
) (dto.ClientResponse, error) {
	client, err := s.repo.GetClientByID(ctx, id)
	if err != nil {
		return dto.ClientResponse{}, err
	}

	imageURL, _ := s.GetPresignedURL(ctx, client.ImageLocation)

	return dto.ClientResponse{
		ID:            client.ID,
		ClientName:    client.ClientName,
		ClientSecret:  client.ClientSecret,
		BaseURL:       client.BaseURL,
		Description:   client.Description,
		ImageLocation: client.ImageLocation,
		ImageURL:      imageURL,
	}, nil
}

func (s *clientService) GetAllClients(
	ctx context.Context,
) ([]dto.ClientResponse, error) {
	clients, err := s.repo.GetAllClients(ctx)
	if err != nil {
		return nil, err
	}

	var res []dto.ClientResponse
	for _, cl := range clients {
		imageURL, _ := s.GetPresignedURL(ctx, cl.ImageLocation)
		res = append(res, dto.ClientResponse{
			ID:            cl.ID,
			ClientName:    cl.ClientName,
			ClientSecret:  cl.ClientSecret,
			BaseURL:       cl.BaseURL,
			Description:   cl.Description,
			ImageLocation: cl.ImageLocation,
			ImageURL:      imageURL,
		})
	}
	return res, nil
}

func (s *clientService) UpdateClient(
	ctx context.Context,
	req dto.ClientRequest,
) error {
	client := models.Client{
		ID:            req.ID,
		ClientName:    req.ClientName,
		ClientSecret:  req.ClientSecret,
		BaseURL:       req.BaseURL,
		Description:   req.Description,
		ImageLocation: req.ImageLocation,
		OldSecret:     req.OldSecret,
	}
	return s.repo.UpdateClient(ctx, client)
}

func (s *clientService) DeleteClient(
	ctx context.Context,
	id uuid.UUID,
) error {
	return s.repo.DeleteClient(ctx, id)
}

func (s *clientService) GetPresignedURL(
	ctx context.Context,
	object string,
) (string, error) {
	if s.storage == nil {
		return "", fmt.Errorf("[ClientService] Storage not initialized")
	}
	return s.storage.GetPresignedURL(ctx, object)
}
