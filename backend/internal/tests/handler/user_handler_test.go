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
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/tests/mocks"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/mock/gomock"
)

func TestUserHandler_PatchUserName(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	gin.SetMode(gin.TestMode)

	// Mock IDP Server
	idpServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPatch {
			t.Errorf("expected PATCH, got %s", r.Method)
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(dto.SuccessResponse{Message: "IDP Success"})
	}))
	defer idpServer.Close()

	os.Setenv("IDP_USER_URL", idpServer.URL)
	defer os.Unsetenv("IDP_USER_URL")

	svc := mocks.NewMockUserService(ctrl)
	h := v1.NewUserHandler(svc)

	r := gin.New()
	r.PATCH("/user/:id/name", h.PatchUserName)

	userID := uuid.New()
	reqBody := dto.UpdateUserNameRequest{
		FirstName: "John",
		LastName:  "Doe",
	}
	body, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPatch, "/user/"+userID.String()+"/name", bytes.NewBuffer(body))
	w := httptest.NewRecorder()

	svc.EXPECT().
		UpdateUserName(gomock.Any(), userID, reqBody).
		Return(nil).
		Times(1)

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
		t.Logf("Response body: %s", w.Body.String())
	}
}

func TestUserHandler_ProxyPasswordEndpoints(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	gin.SetMode(gin.TestMode)

	mockIDP := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(dto.SuccessResponse{Message: "IDP Success"})
	}))
	defer mockIDP.Close()

	os.Setenv("IDP_USER_URL", mockIDP.URL)
	defer os.Unsetenv("IDP_USER_URL")

	svc := mocks.NewMockUserService(ctrl)
	h := v1.NewUserHandler(svc)
	r := gin.New()
	r.PATCH("/user/password/forgot", h.PatchUserPasswordByEmail)
	r.PATCH("/user/password/change", h.PatchChangePassword)

	// 1. Test forgot password
	forgotBody, _ := json.Marshal(dto.UpdatePasswordByEmailRequest{
		Email:       "test@example.com",
		NewPassword: "newpassword123",
	})
	req1 := httptest.NewRequest(http.MethodPatch, "/user/password/forgot", bytes.NewBuffer(forgotBody))
	w1 := httptest.NewRecorder()
	r.ServeHTTP(w1, req1)
	if w1.Code != http.StatusOK {
		t.Errorf("forgot pass: expected 200, got %d", w1.Code)
	}

	// 2. Test change password
	changeBody, _ := json.Marshal(dto.ChangePasswordRequest{
		OldPassword: "oldpassword",
		NewPassword: "newpassword123",
	})
	req2 := httptest.NewRequest(http.MethodPatch, "/user/password/change", bytes.NewBuffer(changeBody))
	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, req2)
	if w2.Code != http.StatusOK {
		t.Errorf("change pass: expected 200, got %d", w2.Code)
	}
}
