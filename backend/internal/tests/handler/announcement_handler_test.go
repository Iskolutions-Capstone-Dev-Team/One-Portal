package handler_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	v1 "github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/api/v1"
	"github.com/gin-gonic/gin"
)

func TestAnnouncementHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{"announcement": "test"})
	}))
	defer mockServer.Close()

	os.Setenv("ANNOUNCEMENT_URL", mockServer.URL)
	os.Setenv("ANNOUNCEMENT_API_KEY", "test-key")
	defer func() {
		os.Unsetenv("ANNOUNCEMENT_URL")
		os.Unsetenv("ANNOUNCEMENT_API_KEY")
	}()

	h := v1.NewAnnouncementHandler()
	r := gin.New()
	r.GET("/announcements", h.HandleGetAnnouncement)

	req := httptest.NewRequest(http.MethodGet, "/announcements", nil)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}
