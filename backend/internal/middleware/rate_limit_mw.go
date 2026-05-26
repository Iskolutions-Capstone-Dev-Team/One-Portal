// Package middleware provides HTTP middleware for the One-Portal API.
package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// ipLimiter stores a rate limiter per client IP address.
type ipLimiter struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

// limiterStore holds per-IP limiters and a mutex for safe access.
type limiterStore struct {
	mu       sync.Mutex
	limiters map[string]*ipLimiter
	// interval is how often the limiter replenishes one token.
	interval time.Duration
	// burst is the maximum burst size above the steady-state rate.
	burst int
}

// newLimiterStore creates a store with the given replenishment
// interval and burst size.
func newLimiterStore(
	interval time.Duration,
	burst int,
) *limiterStore {
	s := &limiterStore{
		limiters: make(map[string]*ipLimiter),
		interval: interval,
		burst:    burst,
	}
	go s.cleanup()
	return s
}

// getLimiter returns (or creates) the rate.Limiter for a given IP.
func (s *limiterStore) getLimiter(ip string) *rate.Limiter {
	s.mu.Lock()
	defer s.mu.Unlock()

	entry, ok := s.limiters[ip]
	if !ok {
		lim := rate.NewLimiter(rate.Every(s.interval), s.burst)
		s.limiters[ip] = &ipLimiter{
			limiter:  lim,
			lastSeen: time.Now(),
		}
		return lim
	}

	entry.lastSeen = time.Now()
	return entry.limiter
}

// cleanup removes IP entries that have been idle for 10 minutes to
// prevent unbounded memory growth.
func (s *limiterStore) cleanup() {
	for {
		time.Sleep(10 * time.Minute)
		s.mu.Lock()
		for ip, entry := range s.limiters {
			if time.Since(entry.lastSeen) > 10*time.Minute {
				delete(s.limiters, ip)
			}
		}
		s.mu.Unlock()
	}
}

// OTPRateLimiter allows 3 requests per IP per 60 seconds (burst 3).
// Generous enough for legitimate users who may need to resend an OTP,
// tight enough to prevent automated email-bombing.
var OTPRateLimiter = newLimiterStore(20*time.Second, 3)

// RateLimitMiddleware returns a Gin middleware that enforces per-IP
// rate limiting using the provided limiterStore.
func RateLimitMiddleware(store *limiterStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		if !store.getLimiter(ip).Allow() {
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
