package handler_test

import (
	"bytes"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/api"
	v1 "github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/initializers"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/middleware"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/tests/mocks"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/mock/gomock"
)

type fakeRoundTripper struct {
	lastRequest *http.Request
}

func (f *fakeRoundTripper) RoundTrip(r *http.Request) (*http.Response, error) {
	f.lastRequest = r
	return &http.Response{
		StatusCode: http.StatusOK,
		Body:       io.NopCloser(bytes.NewBufferString(`{"status":"ok"}`)),
	}, nil
}

func setupTestRouter(
	ctrl *gomock.Controller,
) (*gin.Engine, string, *mocks.MockAuthService, *mocks.MockUserService, *mocks.MockLogService) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	validAPIKey := os.Getenv("VITE_BACKEND_API_KEY")
	if validAPIKey == "" {
		keyBytes := make([]byte, 32)
		_, _ = rand.Read(keyBytes)
		validAPIKey = hex.EncodeToString(keyBytes)
		os.Setenv("VITE_BACKEND_API_KEY", validAPIKey)
	}

	authSvc := mocks.NewMockAuthService(ctrl)
	userSvc := mocks.NewMockUserService(ctrl)
	logSvc := mocks.NewMockLogService(ctrl)

	services := &initializers.Services{
		Log:          logSvc,
		RefreshToken: authSvc,
		User:         userSvc,
	}
	handlers := initializers.InitHandlers(services)
	routes := api.NewRoutes(handlers)
	routes.Register(r)

	return r, validAPIKey, authSvc, userSvc, logSvc
}

func TestAuthHandlerLogout(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	router, key, authSvc, _, _ := setupTestRouter(ctrl)

	// Mock IDP logout
	os.Setenv("IDP_LOGOUT_URL", "http://idp/logout")
	os.Setenv("CLIENT_ID", "test-client")
	defer os.Unsetenv("IDP_LOGOUT_URL")
	defer os.Setenv("CLIENT_ID", "")

	// Set fake transport to capture IDP call
	origTransport := v1.Client.Transport
	fTripper := &fakeRoundTripper{}
	v1.Client.Transport = fTripper
	defer func() { v1.Client.Transport = origTransport }()

	// Create a dummy token with a sub claim
	uid := uuid.New()
	pld := `{"sub":"` + uid.String() + `"}`
	b64Pld := base64.RawURLEncoding.EncodeToString([]byte(pld))
	token := "eyJhbGciOiJub25lIn0." + b64Pld + ".sig"

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/auth/logout",
		nil,
	)
	req.Header.Set(middleware.APIHeaderKey, key)
	req.AddCookie(&http.Cookie{
		Name:  "access_token",
		Value: token,
	})

	w := httptest.NewRecorder()

	authSvc.EXPECT().DeleteTokensByUserID(gomock.Any(), uid[:]).Return(nil).Times(1)

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	// Check if cookie was cleared
	cookies := w.Result().Cookies()
	cleared := false
	for _, c := range cookies {
		if c.Name == "access_token" && c.MaxAge < 0 {
			cleared = true
			break
		}
	}
	if !cleared {
		t.Error("expected access_token cookie to be cleared")
	}

	// Check if IDP was notified
	if fTripper.lastRequest == nil {
		t.Error("expected IDP logout notification")
	} else if !bytes.HasPrefix([]byte(fTripper.lastRequest.URL.String()),
		[]byte("http://idp/logout")) {
		t.Errorf("wrong IDP URL: %s", fTripper.lastRequest.URL.String())
	}
}

func TestAuthHandlerHandleAuthorization(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	router, key, _, _, _ := setupTestRouter(ctrl)

	os.Setenv("IDP_AUTH_URL", "http://idp/auth")
	os.Setenv("CLIENT_ID", "test-client")
	os.Setenv("VITE_REDIRECT_URI", "http://app/callback")
	defer func() {
		os.Unsetenv("IDP_AUTH_URL")
		os.Unsetenv("CLIENT_ID")
		os.Unsetenv("VITE_REDIRECT_URI")
	}()

	req := httptest.NewRequest(
		http.MethodGet,
		"/api/v1/auth/authorize",
		nil,
	)
	req.Header.Set(middleware.APIHeaderKey, key)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Implementation now returns 200 JSON
	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}

	var resp map[string]string
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	expectedPrefix := "http://idp/auth?client_id=test-client"
	if !bytes.HasPrefix([]byte(resp["url"]), []byte(expectedPrefix)) {
		t.Errorf("expected prefix %s, got %s", expectedPrefix, resp["url"])
	}
}
