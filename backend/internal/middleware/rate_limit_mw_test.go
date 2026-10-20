package middleware

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
)

func TestOnePortal_LimiterStore_AllowMemory(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// Burst 2, interval 100ms
	store := NewLimiterStore(nil, 100*time.Millisecond, 2)

	ctx := context.Background()
	key := "test:portal:client1"

	if !store.Allow(ctx, key) {
		t.Fatalf("first request should be allowed")
	}
	if !store.Allow(ctx, key) {
		t.Fatalf("second request should be allowed")
	}
	if store.Allow(ctx, key) {
		t.Fatalf("third request within burst should be blocked")
	}

	time.Sleep(120 * time.Millisecond)
	if !store.Allow(ctx, key) {
		t.Fatalf("request after replenishment should be allowed")
	}
}

func TestOnePortal_UserIsolationOnSameNAT(t *testing.T) {
	gin.SetMode(gin.TestMode)

	store := NewLimiterStore(nil, 1*time.Second, 2)

	r := gin.New()
	r.Use(func(c *gin.Context) {
		if uid := c.GetHeader("X-User-ID"); uid != "" {
			c.Set("userID", uid)
		}
		c.Next()
	})
	r.Use(RateLimitWithKey(store, UserKeyExtractor))
	r.GET("/devices", func(c *gin.Context) {
		c.String(http.StatusOK, "devices list")
	})

	// Student 1 makes 2 requests
	for i := 0; i < 2; i++ {
		req := httptest.NewRequest(http.MethodGet, "/devices", nil)
		req.Header.Set("X-Forwarded-For", "203.0.113.1")
		req.Header.Set("X-User-ID", "student-user-1")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("student 1 request %d expected 200, got %d", i+1, w.Code)
		}
	}

	// Student 1 third request hits limit -> 429
	{
		req := httptest.NewRequest(http.MethodGet, "/devices", nil)
		req.Header.Set("X-Forwarded-For", "203.0.113.1")
		req.Header.Set("X-User-ID", "student-user-1")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusTooManyRequests {
			t.Fatalf("student 1 3rd request expected 429, got %d", w.Code)
		}
	}

	// Student 2 on the SAME campus NAT IP must succeed with 200!
	{
		req := httptest.NewRequest(http.MethodGet, "/devices", nil)
		req.Header.Set("X-Forwarded-For", "203.0.113.1")
		req.Header.Set("X-User-ID", "student-user-2")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf(
				"student 2 on same NAT IP expected 200, got %d",
				w.Code,
			)
		}
	}
}

func TestOnePortal_TargetOTPLimiter(t *testing.T) {
	gin.SetMode(gin.TestMode)

	store := NewLimiterStore(nil, 1*time.Second, 1)

	r := gin.New()
	r.Use(RateLimitWithKey(store, TargetEmailKeyExtractor))
	r.POST("/otp/send", func(c *gin.Context) {
		c.String(http.StatusOK, "otp sent")
	})

	req1 := httptest.NewRequest(
		http.MethodPost,
		"/otp/send?email=userA@school.edu",
		nil,
	)
	req1.Header.Set("X-Forwarded-For", "198.51.100.5")
	w1 := httptest.NewRecorder()
	r.ServeHTTP(w1, req1)
	if w1.Code != http.StatusOK {
		t.Fatalf("userA first request expected 200, got %d", w1.Code)
	}

	// Immediate repeat for userA gets 429
	req2 := httptest.NewRequest(
		http.MethodPost,
		"/otp/send?email=userA@school.edu",
		nil,
	)
	req2.Header.Set("X-Forwarded-For", "198.51.100.5")
	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, req2)
	if w2.Code != http.StatusTooManyRequests {
		t.Fatalf("userA second request expected 429, got %d", w2.Code)
	}

	// userB on the SAME NAT IP gets 200!
	req3 := httptest.NewRequest(
		http.MethodPost,
		"/otp/send?email=userB@school.edu",
		nil,
	)
	req3.Header.Set("X-Forwarded-For", "198.51.100.5")
	w3 := httptest.NewRecorder()
	r.ServeHTTP(w3, req3)
	if w3.Code != http.StatusOK {
		t.Fatalf("userB on same NAT IP expected 200, got %d", w3.Code)
	}
}
