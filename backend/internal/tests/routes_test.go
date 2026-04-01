package tests

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/api"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/initializers"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/gin-gonic/gin"
)

// fakeLogService is a test stub for service.LogService.
type fakeLogService struct{}

func (f *fakeLogService) LogAction(ctx context.Context,
	actor, action string,
) error {
	return nil
}

func (f *fakeLogService) GetLogs(ctx context.Context,
	actor string, limit, offset int,
) ([]models.Log, error) {
	return []models.Log{{ID: 1, Actor: "test", Action: "x", Result: "ok"}}, nil
}

func TestRoutesRegisterAndLogHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()

	services := &initializers.Services{Log: &fakeLogService{}}
	handlers := initializers.InitHandlers(services)
	routes := api.NewRoutes(handlers)
	routes.Register(router)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/logs", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf(
			"expected status 200, got %d; body=%s",
			w.Code,
			w.Body.String(),
		)
	}
}
