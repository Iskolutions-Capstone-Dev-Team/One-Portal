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

	handlerFunc := http.HandlerFunc(func(
		w http.ResponseWriter,
		r *http.Request,
	) {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode([]dto.ClientDetailedAccessResponse{})
	})

	idpServer := httptest.NewServer(handlerFunc)
	defer idpServer.Close()

	os.Setenv("IDP_ACCESS_URL", idpServer.URL)
	os.Setenv("VITE_BACKEND_API_KEY", "test-key")
	defer func() {
		os.Unsetenv("IDP_ACCESS_URL")
		os.Unsetenv("VITE_BACKEND_API_KEY")
	}()

	// Pass nil cache: handler degrades gracefully to live IDP proxy.
	h := v1.NewUserAccessHandler(nil)
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

func TestUserAccessHandler_OnePortalLinkOverride(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockClients := []dto.ClientDetailedAccessResponse{
		{
			ID:            "client-1",
			Name:          "Client One",
			BaseURL:       "http://base-one.com",
			OnePortalLink: "http://override-one.com",
		},
		{
			ID:            "client-2",
			Name:          "Client Two",
			BaseURL:       "http://base-two.com",
			OnePortalLink: "",
		},
	}

	handlerFunc := http.HandlerFunc(func(
		w http.ResponseWriter,
		r *http.Request,
	) {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(mockClients)
	})

	idpServer := httptest.NewServer(handlerFunc)
	defer idpServer.Close()

	os.Setenv("IDP_ACCESS_URL", idpServer.URL)
	os.Setenv("VITE_BACKEND_API_KEY", "test-key")
	defer func() {
		os.Unsetenv("IDP_ACCESS_URL")
		os.Unsetenv("VITE_BACKEND_API_KEY")
	}()

	h := v1.NewUserAccessHandler(nil)
	r := gin.New()
	r.GET("/users/access", h.GetUserDetailedAccess)

	req := httptest.NewRequest(http.MethodGet, "/users/access", nil)
	cookie := &http.Cookie{
		Name:  "access_token",
		Value: "token-123",
	}
	req.AddCookie(cookie)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	var response []dto.ClientDetailedAccessResponse
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if len(response) != 2 {
		t.Fatalf("expected 2 clients, got %d", len(response))
	}

	if response[0].BaseURL != "http://override-one.com" {
		t.Errorf(
			"expected override to http://override-one.com, got %s",
			response[0].BaseURL,
		)
	}

	if response[1].BaseURL != "http://base-two.com" {
		t.Errorf(
			"expected base http://base-two.com, got %s",
			response[1].BaseURL,
		)
	}
}
