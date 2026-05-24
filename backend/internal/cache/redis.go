// Package cache provides a thin Redis-backed caching abstraction.
package cache

import (
	"context"
	"errors"
	"time"

	"github.com/redis/go-redis/v9"
)

// Cache defines the minimal caching interface used by services.
type Cache interface {
	// Set stores val under key for the given duration.
	Set(
		ctx context.Context,
		key, val string,
		ttl time.Duration,
	) error

	// Get retrieves the value for key.
	// Returns ("", false, nil) on a cache miss.
	Get(ctx context.Context, key string) (string, bool, error)

	// Delete removes the given key from the cache.
	Delete(ctx context.Context, key string) error
}

type redisCache struct {
	client *redis.Client
}

// NewRedisCache creates a Cache backed by the provided redis.Client.
func NewRedisCache(client *redis.Client) Cache {
	return &redisCache{client: client}
}

func (r *redisCache) Set(
	ctx context.Context,
	key, val string,
	ttl time.Duration,
) error {
	return r.client.Set(ctx, key, val, ttl).Err()
}

func (r *redisCache) Get(
	ctx context.Context,
	key string,
) (string, bool, error) {
	val, err := r.client.Get(ctx, key).Result()
	if errors.Is(err, redis.Nil) {
		// Cache miss — not an error
		return "", false, nil
	}
	if err != nil {
		return "", false, err
	}
	return val, true, nil
}

func (r *redisCache) Delete(
	ctx context.Context,
	key string,
) error {
	return r.client.Del(ctx, key).Err()
}
