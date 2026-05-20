package handler_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	v1 "github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/gin-gonic/gin"
)

func TestUserAccessHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	idpServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode([]dto.ClientDetailedAccessResponse{})
	}))
	defer idpServer.Close()

	os.Setenv("IDP_ACCESS_URL", idpServer.URL)
	os.Setenv("VITE_BACKEND_API_KEY", "test-key")
	defer func() {
		os.Unsetenv("IDP_ACCESS_URL")
		os.Unsetenv("VITE_BACKEND_API_KEY")
	}()

	h := v1.NewUserAccessHandler()
	r := gin.New()
	r.GET("/users/access", h.GetUserDetailedAccess)

	req := httptest.NewRequest(http.MethodGet, "/users/access", nil)
	req.AddCookie(&http.Cookie{Name: "access_token", Value: "token-123"})
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}
