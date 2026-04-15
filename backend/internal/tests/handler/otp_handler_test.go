package handler_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	v1 "github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/gin-gonic/gin"
)

func TestOTPHandler_SendOTP(t *testing.T) {
	gin.SetMode(gin.TestMode)
	
	idpServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Errorf("expected POST, got %s", r.Method)
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(dto.SuccessResponse{Message: "IDP Success"})
	}))
	defer idpServer.Close()
	
	os.Setenv("IDP_OTP_URL", idpServer.URL)
	defer os.Unsetenv("IDP_OTP_URL")

	h := v1.NewOTPHandler()
	r := gin.New()
	r.POST("/api/v1/otp/send", h.SendOTP)

	reqBody := dto.OTPRequest{Email: "test@example.com"}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/otp/send", bytes.NewBuffer(body))
	w := httptest.NewRecorder()
	
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}

func TestOTPHandler_VerifyOTP(t *testing.T) {
	gin.SetMode(gin.TestMode)
	
	idpServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(dto.SuccessResponse{Message: "IDP Success"})
	}))
	defer idpServer.Close()
	
	os.Setenv("IDP_OTP_URL", idpServer.URL)
	defer os.Unsetenv("IDP_OTP_URL")

	h := v1.NewOTPHandler()
	r := gin.New()
	r.POST("/api/v1/otp/verify", h.VerifyOTP)

	reqBody := dto.VerifyOTPRequest{Email: "test@example.com", OTP: "123456"}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/otp/verify", bytes.NewBuffer(body))
	w := httptest.NewRecorder()
	
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}
