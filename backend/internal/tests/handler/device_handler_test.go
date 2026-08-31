package handler_test

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	v1 "github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/api/v1"
	"github.com/gin-gonic/gin"
)

func TestDeviceHandler_ListDevices(t *testing.T) {
	gin.SetMode(gin.TestMode)

	idpServer := httptest.NewServer(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method != http.MethodGet {
				t.Errorf("expected GET, got %s", r.Method)
			}
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`[]`))
		}),
	)
	defer idpServer.Close()

	os.Setenv("IDP_DEVICES_URL", idpServer.URL)
	defer os.Unsetenv("IDP_DEVICES_URL")

	h := v1.NewDeviceHandler()
	r := gin.New()
	r.GET("/api/v1/devices", h.ListDevices)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/devices", nil)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}

func TestDeviceHandler_UpdateDevice(t *testing.T) {
	gin.SetMode(gin.TestMode)

	idpServer := httptest.NewServer(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method != http.MethodPatch {
				t.Errorf("expected PATCH, got %s", r.Method)
			}
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`{"message":"updated"}`))
		}),
	)
	defer idpServer.Close()

	os.Setenv("IDP_DEVICES_URL", idpServer.URL)
	defer os.Unsetenv("IDP_DEVICES_URL")

	h := v1.NewDeviceHandler()
	r := gin.New()
	r.PATCH("/api/v1/devices/:id", h.UpdateDevice)

	body := []byte(`{"device_name":"New Name"}`)
	req := httptest.NewRequest(
		http.MethodPatch,
		"/api/v1/devices/123",
		bytes.NewBuffer(body),
	)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}

func TestDeviceHandler_DeleteDevice(t *testing.T) {
	gin.SetMode(gin.TestMode)

	idpServer := httptest.NewServer(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method != http.MethodDelete {
				t.Errorf("expected DELETE, got %s", r.Method)
			}
			w.WriteHeader(http.StatusOK)
		}),
	)
	defer idpServer.Close()

	os.Setenv("IDP_DEVICES_URL", idpServer.URL)
	defer os.Unsetenv("IDP_DEVICES_URL")

	h := v1.NewDeviceHandler()
	r := gin.New()
	r.DELETE("/api/v1/devices/:id", h.DeleteDevice)

	req := httptest.NewRequest(
		http.MethodDelete,
		"/api/v1/devices/123",
		nil,
	)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}
