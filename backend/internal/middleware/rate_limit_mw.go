// Package middleware provides HTTP middleware for the One-Portal API.
package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/cache"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// KeyExtractor extracts a unique rate-limiting key from a Gin context.
type KeyExtractor func(c *gin.Context) string

type memoryLimiterEntry struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

// LimiterStore coordinates distributed and in-memory rate limiting.
type LimiterStore struct {
	cache    cache.Cache
	mu       sync.Mutex
	limiters map[string]*memoryLimiterEntry
	interval time.Duration
	burst    int
}

// NewLimiterStore creates a store with the given replenishment
// interval and burst size.
func NewLimiterStore(
	appCache cache.Cache,
	interval time.Duration,
	burst int,
) *LimiterStore {
	store := &LimiterStore{
		cache:    appCache,
		limiters: make(map[string]*memoryLimiterEntry),
		interval: interval,
		burst:    burst,
	}
	go store.cleanupRoutine()
	return store
}

// SetCache sets or updates the cache instance used by the store.
func (s *LimiterStore) SetCache(appCache cache.Cache) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.cache = appCache
}

func (s *LimiterStore) cleanupRoutine() {
	ticker := time.NewTicker(10 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		s.mu.Lock()
		now := time.Now()
		for key, entry := range s.limiters {
			if now.Sub(entry.lastSeen) > 15*time.Minute {
				delete(s.limiters, key)
			}
		}
		s.mu.Unlock()
	}
}

func (s *LimiterStore) allowMemory(key string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	entry, ok := s.limiters[key]
	if !ok {
		lim := rate.NewLimiter(rate.Every(s.interval), s.burst)
		s.limiters[key] = &memoryLimiterEntry{
			limiter:  lim,
			lastSeen: time.Now(),
		}
		return lim.Allow()
	}

	entry.lastSeen = time.Now()
	return entry.limiter.Allow()
}

// Allow evaluates if a request with key should be allowed.
func (s *LimiterStore) Allow(ctx context.Context, key string) bool {
	if s.cache != nil {
		windowSeconds := int64(s.interval.Seconds()) * int64(s.burst)
		if windowSeconds < 1 {
			windowSeconds = 60
		}

		redisKey := fmt.Sprintf("rl:%s:%d", key, time.Now().Unix()/windowSeconds)
		count, err := s.cache.Incr(ctx, redisKey)
		if err == nil {
			if count == 1 {
				_ = s.cache.Set(
					ctx,
					redisKey,
					strconv.FormatInt(count, 10),
					time.Duration(windowSeconds*2)*time.Second,
				)
			}
			return int(count) <= s.burst
		}
	}

	return s.allowMemory(key)
}

// Global default limiters designed for high-concurrency campus NAT.
var (
	// LooseIPLimiter allows up to 300 requests/min per IP.
	LooseIPLimiter = NewLimiterStore(nil, 200*time.Millisecond, 300)

	// UserLimiter allows up to 120 requests/min per authenticated user.
	UserLimiter = NewLimiterStore(nil, 500*time.Millisecond, 120)

	// SensitiveIPLimiter allows up to 120 requests/min per IP.
	SensitiveIPLimiter = NewLimiterStore(nil, 500*time.Millisecond, 120)

	// TargetOTPLimiter allows 3 attempts per 60 seconds per recipient.
	TargetOTPLimiter = NewLimiterStore(nil, 20*time.Second, 3)

	// OTPRateLimiter is maintained for backward compatibility.
	OTPRateLimiter = TargetOTPLimiter
)

// IPKeyExtractor extracts client IP.
func IPKeyExtractor(c *gin.Context) string {
	return "ip:" + c.ClientIP()
}

// UserKeyExtractor extracts authenticated user ID or falls back to IP.
func UserKeyExtractor(c *gin.Context) string {
	userID := c.GetString("userID")
	if userID != "" {
		return "user:" + userID
	}
	return IPKeyExtractor(c)
}

// TargetEmailKeyExtractor extracts email from query, body, or IP.
func TargetEmailKeyExtractor(c *gin.Context) string {
	email := strings.TrimSpace(c.Query("email"))
	if email != "" {
		return "target:" + strings.ToLower(email)
	}
	return IPKeyExtractor(c)
}

// RateLimitWithKey applies rate limiting using a custom key extractor.
func RateLimitWithKey(
	store *LimiterStore,
	keyFn KeyExtractor,
) gin.HandlerFunc {
	return func(c *gin.Context) {
		key := keyFn(c)
		if !store.Allow(c.Request.Context(), key) {
			c.AbortWithStatusJSON(
				http.StatusTooManyRequests,
				dto.ErrorResponse{
					Error: "Too many requests, please try again later",
				},
			)
			return
		}
		c.Next()
	}
}

// RateLimitMiddleware returns a Gin middleware that enforces rate limiting
// using the provided LimiterStore. Defaults to LooseIPLimiter if nil.
func RateLimitMiddleware(store *LimiterStore) gin.HandlerFunc {
	if store == nil {
		store = LooseIPLimiter
	}
	return RateLimitWithKey(store, IPKeyExtractor)
}

// UserRateLimitMiddleware enforces rate limiting per authenticated user.
func UserRateLimitMiddleware() gin.HandlerFunc {
	return RateLimitWithKey(UserLimiter, UserKeyExtractor)
}

// SensitiveRateLimitMiddleware enforces strict rate limiting per IP.
func SensitiveRateLimitMiddleware() gin.HandlerFunc {
	return RateLimitWithKey(SensitiveIPLimiter, IPKeyExtractor)
}
