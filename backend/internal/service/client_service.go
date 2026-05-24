package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/cache"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/storage"
	"github.com/google/uuid"
)

const (
	// clientListCacheKey is the Redis key for the full client list.
	clientListCacheKey = "clients:all"
	// clientCachePrefix is the prefix for per-client cache keys.
	clientCachePrefix = "clients:"
	// clientCacheTTL is the cache lifetime for client data.
	// Clients change infrequently; 60s avoids N+1 S3 calls on page load.
	clientCacheTTL = 60 * time.Second
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
	cache   cache.Cache
}

// NewClientService creates a ClientService.
// c may be nil; caching is bypassed gracefully if unavailable.
func NewClientService(
	repo repository.ClientRepository,
	storage *storage.S3Provider,
	c cache.Cache,
) ClientService {
	return &clientService{
		repo:    repo,
		storage: storage,
		cache:   c,
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
	if err := s.repo.CreateClient(ctx, client); err != nil {
		return err
	}
	// Invalidate list cache so next GET reflects the new client
	s.invalidateListCache(ctx)
	return nil
}

func (s *clientService) GetClientByID(
	ctx context.Context,
	id uuid.UUID,
) (dto.ClientResponse, error) {
	cacheKey := clientCachePrefix + id.String()

	// 1. Check cache
	if s.cache != nil {
		if val, hit, err := s.cache.Get(ctx, cacheKey); hit && err == nil {
			var res dto.ClientResponse
			if json.Unmarshal([]byte(val), &res) == nil {
				return res, nil
			}
		}
	}

	// 2. Cache miss — fetch from DB
	client, err := s.repo.GetClientByID(ctx, id)
	if err != nil {
		return dto.ClientResponse{}, err
	}

	imageURL, _ := s.GetPresignedURL(ctx, client.ImageLocation)

	res := dto.ClientResponse{
		ID:            client.ID,
		ClientName:    client.ClientName,
		BaseURL:       client.BaseURL,
		Description:   client.Description,
		ImageLocation: client.ImageLocation,
		ImageURL:      imageURL,
	}

	// 3. Populate cache
	s.setCache(ctx, cacheKey, res)
	return res, nil
}

func (s *clientService) GetAllClients(
	ctx context.Context,
) ([]dto.ClientResponse, error) {
	// 1. Check cache
	if s.cache != nil {
		if val, hit, err := s.cache.Get(ctx, clientListCacheKey); hit && err == nil {
			var res []dto.ClientResponse
			if json.Unmarshal([]byte(val), &res) == nil {
				return res, nil
			}
		}
	}

	// 2. Cache miss — fetch from DB + generate presigned URLs
	clients, err := s.repo.GetAllClients(ctx)
	if err != nil {
		return nil, err
	}

	res := make([]dto.ClientResponse, 0, len(clients))
	for _, cl := range clients {
		imageURL, _ := s.GetPresignedURL(ctx, cl.ImageLocation)
		res = append(res, dto.ClientResponse{
			ID:            cl.ID,
			ClientName:    cl.ClientName,
			BaseURL:       cl.BaseURL,
			Description:   cl.Description,
			ImageLocation: cl.ImageLocation,
			ImageURL:      imageURL,
		})
	}

	// 3. Populate cache
	s.setCache(ctx, clientListCacheKey, res)
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
	if err := s.repo.UpdateClient(ctx, client); err != nil {
		return err
	}
	// Invalidate both the specific entry and the list cache
	s.invalidateClientCache(ctx, req.ID)
	return nil
}

func (s *clientService) DeleteClient(
	ctx context.Context,
	id uuid.UUID,
) error {
	if err := s.repo.DeleteClient(ctx, id); err != nil {
		return err
	}
	// Invalidate both the specific entry and the list cache
	s.invalidateClientCache(ctx, id)
	return nil
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

// setCache serialises val as JSON and writes it under key with the
// standard clientCacheTTL. Errors are logged but not propagated.
func (s *clientService) setCache(
	ctx context.Context,
	key string,
	val interface{},
) {
	if s.cache == nil {
		return
	}
	raw, err := json.Marshal(val)
	if err != nil {
		log.Printf("[ClientService] Cache marshal error for %s: %v", key, err)
		return
	}
	if err := s.cache.Set(ctx, key, string(raw), clientCacheTTL); err != nil {
		log.Printf("[ClientService] Cache set error for %s: %v", key, err)
	}
}

// invalidateListCache removes the full client list from cache.
func (s *clientService) invalidateListCache(ctx context.Context) {
	if s.cache == nil {
		return
	}
	if err := s.cache.Delete(ctx, clientListCacheKey); err != nil {
		log.Printf(
			"[ClientService] Cache invalidation error for %s: %v",
			clientListCacheKey, err,
		)
	}
}

// invalidateClientCache removes a specific client and the list cache.
func (s *clientService) invalidateClientCache(
	ctx context.Context,
	id uuid.UUID,
) {
	if s.cache == nil {
		return
	}
	cacheKey := clientCachePrefix + id.String()
	if err := s.cache.Delete(ctx, cacheKey); err != nil {
		log.Printf(
			"[ClientService] Cache invalidation error for %s: %v",
			cacheKey, err,
		)
	}
	s.invalidateListCache(ctx)
}
