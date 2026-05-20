package handler_test

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/api"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/initializers"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/middleware"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/tests/mocks"
	"github.com/gin-gonic/gin"
	"go.uber.org/mock/gomock"
)

func TestRoutesRegisterAndLogHandler(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	gin.SetMode(gin.TestMode)
	router := gin.New()

	validAPIKey := os.Getenv("VITE_BACKEND_API_KEY")
	if validAPIKey == "" {
		keyBytes := make([]byte, 32)
		_, _ = rand.Read(keyBytes)
		validAPIKey = hex.EncodeToString(keyBytes)
	}
	os.Setenv("VITE_BACKEND_API_KEY", validAPIKey)
	defer os.Unsetenv("VITE_BACKEND_API_KEY")

	logSvc := mocks.NewMockLogService(ctrl)

	logSvc.EXPECT().
		GetLogs(gomock.Any(), "", 20, 0).
		Return([]models.Log{{ID: 1, Actor: "test", Action: "x", Result: "ok"}}, nil).
		Times(1)

	services := &initializers.Services{Log: logSvc}
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
