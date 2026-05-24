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
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/tests/mocks"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
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

// TestUserHandler_HandleUserInfo covers the three execution paths of
// the HandleUserInfo handler:
//  1. IDP returns 200 — handler responds with IDP data immediately.
//  2. IDP returns non-200 — handler falls back to the DB via JWT claims.
//  3. IDP returns non-200 and no claims — handler responds 401.
func TestUserHandler_HandleUserInfo(t *testing.T) {
	gin.SetMode(gin.TestMode)

	userID := uuid.New()

	// injectClaims is a middleware that sets the JWT claims in the Gin
	// context, simulating what JWTAuthMiddleware does upstream.
	injectClaims := func(c *gin.Context) {
		claims := jwt.MapClaims{"userId": userID.String()}
		c.Set("claims", claims)
		c.Next()
	}

	t.Run("idp 200 returns idp data directly", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		idpPayload := dto.MeResponse{
			ID:        userID,
			FirstName: "Jane",
			LastName:  "Doe",
			Email:     "jane@example.com",
		}
		idpServer := httptest.NewServer(
			http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				json.NewEncoder(w).Encode(idpPayload)
			}),
		)
		defer idpServer.Close()
		os.Setenv("IDP_USERINFO_URL", idpServer.URL)
		defer os.Unsetenv("IDP_USERINFO_URL")

		svc := mocks.NewMockUserService(ctrl)
		// GetUserByID must NOT be called when IDP succeeds.
		svc.EXPECT().GetUserByID(gomock.Any(), gomock.Any()).Times(0)

		h := v1.NewUserHandler(svc)
		r := gin.New()
		r.Use(injectClaims)
		r.GET("/userinfo", h.HandleUserInfo)

		req := httptest.NewRequest(http.MethodGet, "/userinfo", nil)
		req.AddCookie(&http.Cookie{
			Name:  dto.AccessCookieName,
			Value: "valid-token",
		})
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf(
				"idp 200: expected 200, got %d — body: %s",
				w.Code, w.Body.String(),
			)
		}
		var got dto.MeResponse
		if err := json.NewDecoder(w.Body).Decode(&got); err != nil {
			t.Fatalf("idp 200: could not decode response: %v", err)
		}
		if got.Email != idpPayload.Email {
			t.Errorf(
				"idp 200: expected email %q, got %q",
				idpPayload.Email, got.Email,
			)
		}
	})

	t.Run("idp non-200 falls back to db via claims", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		idpServer := httptest.NewServer(
			http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
				w.WriteHeader(http.StatusUnauthorized)
			}),
		)
		defer idpServer.Close()
		os.Setenv("IDP_USERINFO_URL", idpServer.URL)
		defer os.Unsetenv("IDP_USERINFO_URL")

		dbUser := models.User{
			ID:        userID,
			FirstName: "Jane",
			LastName:  "Doe",
			Email:     "jane@example.com",
		}
		svc := mocks.NewMockUserService(ctrl)
		svc.EXPECT().
			GetUserByID(gomock.Any(), userID).
			Return(dbUser, nil).
			Times(1)

		h := v1.NewUserHandler(svc)
		r := gin.New()
		r.Use(injectClaims)
		r.GET("/userinfo", h.HandleUserInfo)

		req := httptest.NewRequest(http.MethodGet, "/userinfo", nil)
		req.AddCookie(&http.Cookie{
			Name:  dto.AccessCookieName,
			Value: "expired-token",
		})
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf(
				"idp 401 fallback: expected 200, got %d — body: %s",
				w.Code, w.Body.String(),
			)
		}
	})

	t.Run("idp non-200 and no claims returns 401", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		idpServer := httptest.NewServer(
			http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
				w.WriteHeader(http.StatusUnauthorized)
			}),
		)
		defer idpServer.Close()
		os.Setenv("IDP_USERINFO_URL", idpServer.URL)
		defer os.Unsetenv("IDP_USERINFO_URL")

		svc := mocks.NewMockUserService(ctrl)
		svc.EXPECT().GetUserByID(gomock.Any(), gomock.Any()).Times(0)

		h := v1.NewUserHandler(svc)
		// No injectClaims middleware — simulates missing session context.
		r := gin.New()
		r.GET("/userinfo", h.HandleUserInfo)

		req := httptest.NewRequest(http.MethodGet, "/userinfo", nil)
		req.AddCookie(&http.Cookie{
			Name:  dto.AccessCookieName,
			Value: "expired-token",
		})
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusUnauthorized {
			t.Fatalf(
				"no claims: expected 401, got %d — body: %s",
				w.Code, w.Body.String(),
			)
		}
	})
}
