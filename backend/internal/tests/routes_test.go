package tests

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/api"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/initializers"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/middleware"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/gin-gonic/gin"
)

// fakeLogService is a test stub for service.LogService.
type fakeLogService struct{}

func (f *fakeLogService) LogAction(ctx context.Context, actor, action string) error {
	return nil
}

func (f *fakeLogService) GetLogs(ctx context.Context, actor string, limit, offset int) ([]models.Log, error) {
	return []models.Log{{ID: 1, Actor: "test", Action: "x", Result: "ok"}}, nil
}

func TestRoutesRegisterAndLogHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()

	validAPIKey := os.Getenv("VITE_BACKEND_API_KEY")
	if validAPIKey == "" {
		validAPIKey = "2FmnXRyBncCLUgTAdpJPv0Jhc2FmnXRyBncCLUgTAdpJPv0Jhc"
	}
	os.Setenv("VITE_BACKEND_API_KEY", validAPIKey)
	defer os.Unsetenv("VITE_BACKEND_API_KEY")

	services := &initializers.Services{Log: &fakeLogService{}}
	handlers := initializers.InitHandlers(services)
	routes := api.NewRoutes(handlers)
	routes.Register(router)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/logs", nil)
	req.Header.Set(middleware.APIHeaderKey, validAPIKey)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf(
			"expected status 200, got %d; body=%s",
			w.Code, w.Body.String(),
		)
	}
}
