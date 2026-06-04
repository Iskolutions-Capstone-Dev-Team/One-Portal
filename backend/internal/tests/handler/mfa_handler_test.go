package handler_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	v1 "github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/gin-gonic/gin"
)

func TestMFAHandler_GetTOTPSetup(t *testing.T) {
	gin.SetMode(gin.TestMode)

	idpServer := httptest.NewServer(http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			if r.Method != http.MethodGet {
				t.Errorf("expected GET, got %s", r.Method)
			}
			email := r.URL.Query().Get("email")
			if email != "test@example.com" {
				t.Errorf("expected test@example.com, got %s", email)
			}
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(dto.TOTPSetupResponse{
				Secret:     "secret123",
				OTPAuthURI: "otpauth://totp/test@example.com",
			})
		},
	))
	defer idpServer.Close()

	os.Setenv("IDP_MFA_URL", idpServer.URL)
	defer os.Unsetenv("IDP_MFA_URL")

	h := v1.NewMFAHandler()
	r := gin.New()
	r.GET("/api/v1/mfa/setup", h.GetTOTPSetup)

	req := httptest.NewRequest(
		http.MethodGet,
		"/api/v1/mfa/setup?email=test@example.com",
		nil,
	)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}

	var resp dto.TOTPSetupResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatal(err)
	}
	if resp.Secret != "secret123" {
		t.Errorf("expected secret123, got %s", resp.Secret)
	}
}

func TestMFAHandler_PostAuthenticator(t *testing.T) {
	gin.SetMode(gin.TestMode)

	idpServer := httptest.NewServer(http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			if r.Method != http.MethodPost {
				t.Errorf("expected POST, got %s", r.Method)
			}
			var payload dto.TOTPFinalizeRequest
			if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
				t.Fatal(err)
			}
			if payload.Email != "test@example.com" {
				t.Errorf("expected test@example.com, got %s", payload.Email)
			}
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(dto.MFASetupResponse{
				OTPAuthURI:  "otpauth://totp/test@example.com",
				BackupCodes: []string{"code1", "code2"},
			})
		},
	))
	defer idpServer.Close()

	os.Setenv("IDP_MFA_URL", idpServer.URL)
	defer os.Unsetenv("IDP_MFA_URL")

	h := v1.NewMFAHandler()
	r := gin.New()
	r.POST("/api/v1/mfa/authenticators", h.PostAuthenticator)

	reqBody := dto.TOTPFinalizeRequest{
		Email:  "test@example.com",
		Secret: "secret123",
		Code:   "123456",
		Name:   "My Device",
	}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/mfa/authenticators",
		bytes.NewBuffer(body),
	)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}

	var resp dto.MFASetupResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatal(err)
	}
	if len(resp.BackupCodes) != 2 {
		t.Errorf("expected 2 backup codes, got %d", len(resp.BackupCodes))
	}
}

func TestMFAHandler_PostVerifyMFA(t *testing.T) {
	gin.SetMode(gin.TestMode)

	idpServer := httptest.NewServer(http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(dto.SuccessResponse{
				Message: "verified",
			})
		},
	))
	defer idpServer.Close()

	os.Setenv("IDP_MFA_URL", idpServer.URL)
	defer os.Unsetenv("IDP_MFA_URL")

	h := v1.NewMFAHandler()
	r := gin.New()
	r.POST("/api/v1/mfa/verify", h.PostVerifyMFA)

	reqBody := dto.MFAVerifyRequest{
		Email: "test@example.com",
		Code:  "123456",
	}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/mfa/verify",
		bytes.NewBuffer(body),
	)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}

func TestMFAHandler_GetAuthenticatorList(t *testing.T) {
	gin.SetMode(gin.TestMode)

	now := time.Now()
	idpServer := httptest.NewServer(http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode([]dto.MFAAuthenticatorResponse{
				{
					ID:        "auth-1",
					Type:      "totp",
					Name:      "Main TOTP",
					CreatedAt: now,
				},
			})
		},
	))
	defer idpServer.Close()

	os.Setenv("IDP_MFA_URL", idpServer.URL)
	defer os.Unsetenv("IDP_MFA_URL")

	h := v1.NewMFAHandler()
	r := gin.New()
	r.GET("/api/v1/mfa/authenticators/list", h.GetAuthenticatorList)

	req := httptest.NewRequest(
		http.MethodGet,
		"/api/v1/mfa/authenticators/list?email=test@example.com",
		nil,
	)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}

	var resp []dto.MFAAuthenticatorResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatal(err)
	}
	if len(resp) != 1 || resp[0].Name != "Main TOTP" {
		t.Errorf("unexpected list response: %v", resp)
	}
}

func TestMFAHandler_DeleteAuthenticator(t *testing.T) {
	gin.SetMode(gin.TestMode)

	idpServer := httptest.NewServer(http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(dto.SuccessResponse{
				Message: "deleted",
			})
		},
	))
	defer idpServer.Close()

	os.Setenv("IDP_MFA_URL", idpServer.URL)
	defer os.Unsetenv("IDP_MFA_URL")

	h := v1.NewMFAHandler()
	r := gin.New()
	r.DELETE("/api/v1/mfa/authenticators", h.DeleteAuthenticator)

	reqBody := dto.MFADeleteRequest{
		Email: "test@example.com",
		ID:    "auth-1",
	}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest(
		http.MethodDelete,
		"/api/v1/mfa/authenticators",
		bytes.NewBuffer(body),
	)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}
