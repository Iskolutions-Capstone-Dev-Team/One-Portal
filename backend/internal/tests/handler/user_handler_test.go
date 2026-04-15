package handler_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	v1 "github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type mockUserSyncService struct {
	updatedID   uuid.UUID
	updatedReq  dto.UpdateUserNameRequest
	updateCount int
}

func (m *mockUserSyncService) CreateUser(ctx context.Context, user models.User) error { return nil }
func (m *mockUserSyncService) CreateUserFromMe(ctx context.Context, me dto.MeResponse) error { return nil }
func (m *mockUserSyncService) GetUserByID(ctx context.Context, id uuid.UUID) (models.User, error) {
	return models.User{ID: id}, nil
}
func (m *mockUserSyncService) UpdateUserName(ctx context.Context, id uuid.UUID, req dto.UpdateUserNameRequest) error {
	m.updatedID = id
	m.updatedReq = req
	m.updateCount++
	return nil
}

func TestUserHandler_PatchUserName(t *testing.T) {
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

	svc := &mockUserSyncService{}
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
	
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
		t.Logf("Response body: %s", w.Body.String())
	}

	if svc.updateCount != 1 {
		t.Errorf("expected local DB update to be called once, got %d", svc.updateCount)
	}

	if svc.updatedReq.FirstName != "John" {
		t.Errorf("expected FirstName John, got %s", svc.updatedReq.FirstName)
	}
}

func TestUserHandler_ProxyPasswordEndpoints(t *testing.T) {
	gin.SetMode(gin.TestMode)
	
	mockIDP := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(dto.SuccessResponse{Message: "IDP Success"})
	}))
	defer mockIDP.Close()
	
	os.Setenv("IDP_USER_URL", mockIDP.URL)
	defer os.Unsetenv("IDP_USER_URL")

	svc := &mockUserSyncService{}
	h := v1.NewUserHandler(svc)
	r := gin.New()
	r.PATCH("/user/password/forgot", h.PatchUserPasswordByEmail)
	r.PATCH("/user/password/change", h.PatchChangePassword)

	// 1. Test forgot password
	forgotBody, _ := json.Marshal(dto.UpdatePasswordByEmailRequest{
		Email: "test@example.com", 
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
