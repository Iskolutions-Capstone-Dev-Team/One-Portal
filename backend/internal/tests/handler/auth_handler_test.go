package handler_test

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/api"
	v1 "github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/initializers"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/middleware"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// fakeAuthRepoService for AuthService stubbing
type fakeAuthRepoService struct {
	deletedUserID []byte
}

func (f *fakeAuthRepoService) CreateToken(
	ctx context.Context, 
	token models.RefreshToken,
) error {
	return nil
}

func (f *fakeAuthRepoService) GetToken(
	ctx context.Context, 
	token string,
) (models.RefreshToken, error) {
	return models.RefreshToken{}, nil
}

func (f *fakeAuthRepoService) UpdateToken(
	ctx context.Context, 
	token string, 
	expiresAt time.Time,
) error {
	return nil
}

func (f *fakeAuthRepoService) DeleteToken(
	ctx context.Context, 
	token string,
) error {
	return nil
}

func (f *fakeAuthRepoService) DeleteTokensByUserID(
	ctx context.Context, 
	userID []byte,
) error {
	f.deletedUserID = userID
	return nil
}

func (f *fakeAuthRepoService) GetTokenByUserID(
	ctx context.Context, 
	userID []byte,
) (models.RefreshToken, error) {
	return models.RefreshToken{Token: "fake-rt"}, nil
}

func (f *fakeAuthRepoService) DeleteExpiredTokens(
	ctx context.Context, 
	at time.Time,
) (int64, error) {
	return 0, nil
}

type fakeUserRepoService struct{}

func (f *fakeUserRepoService) CreateUser(
	ctx context.Context, 
	user models.User,
) error {
	return nil
}

func (f *fakeUserRepoService) CreateUserFromMe(
	ctx context.Context, 
	me dto.MeResponse,
) error {
	return nil
}

func (f *fakeUserRepoService) GetUserByID(
	ctx context.Context, 
	id uuid.UUID,
) (models.User, error) {
	return models.User{ID: id}, nil
}

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
	authSvc *fakeAuthRepoService,
) (*gin.Engine, string) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	validAPIKey := os.Getenv("VITE_BACKEND_API_KEY")
	if validAPIKey == "" {
		keyBytes := make([]byte, 32)
		_, _ = rand.Read(keyBytes)
		validAPIKey = hex.EncodeToString(keyBytes)
		os.Setenv("VITE_BACKEND_API_KEY", validAPIKey)
	}

	services := &initializers.Services{
		Log:          &fakeLogService{},
		RefreshToken: authSvc,
		User:         &fakeUserRepoService{},
	}
	handlers := initializers.InitHandlers(services)
	routes := api.NewRoutes(handlers)
	routes.Register(r)

	return r, validAPIKey
}

func TestAuthHandlerLogout(t *testing.T) {
	authSvc := &fakeAuthRepoService{}
	router, key := setupTestRouter(authSvc)

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
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	// 1. Check if token was deleted in db
	if authSvc.deletedUserID == nil {
		t.Error("expected RefreshToken deletion attempt")
	} else if !bytes.Equal(authSvc.deletedUserID, uid[:]) {
		t.Errorf("wrong userID deleted: %v", authSvc.deletedUserID)
	}

	// 2. Check if cookie was cleared
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

	// 3. Check if IDP was notified
	if fTripper.lastRequest == nil {
		t.Error("expected IDP logout notification")
	} else if !bytes.HasPrefix([]byte(fTripper.lastRequest.URL.String()), 
		[]byte("http://idp/logout")) {
		t.Errorf("wrong IDP URL: %s", fTripper.lastRequest.URL.String())
	}
}

func TestAuthHandlerHandleAuthorization(t *testing.T) {
	authSvc := &fakeAuthRepoService{}
	router, key := setupTestRouter(authSvc)

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

	// Implementation now returns 302 redirect
	if w.Code != http.StatusFound {
		t.Errorf("expected 302, got %d", w.Code)
	}

	loc := w.Header().Get("Location")
	expectedPrefix := "http://idp/auth?client_id=test-client"
	if !bytes.HasPrefix([]byte(loc), []byte(expectedPrefix)) {
		t.Errorf("expected prefix %s, got %s", expectedPrefix, loc)
	}
}
