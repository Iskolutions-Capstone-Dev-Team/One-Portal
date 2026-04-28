package handler_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	v1 "github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/tests/mocks"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/mock/gomock"
)

func TestClientHandler(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockSvc := mocks.NewMockClientService(ctrl)
	h := v1.NewClientHandler(mockSvc)

	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.POST("/clients", h.CreateClient)
	r.GET("/clients/:id", h.GetClientByID)
	r.GET("/clients", h.GetAllClients)
	r.PUT("/clients/:id", h.UpdateClient)
	r.DELETE("/clients/:id", h.DeleteClient)

	clientID := uuid.New()

	t.Run("CreateClient", func(t *testing.T) {
		reqBody := dto.ClientRequest{ClientName: "Test Client"}
		body, _ := json.Marshal(reqBody)
		req := httptest.NewRequest(http.MethodPost, "/clients", bytes.NewBuffer(body))
		w := httptest.NewRecorder()

		mockSvc.EXPECT().CreateClient(gomock.Any(), reqBody).Return(nil).Times(1)

		r.ServeHTTP(w, req)
		if w.Code != http.StatusCreated {
			t.Errorf("expected 201, got %d", w.Code)
		}
	})

	t.Run("GetClientByID", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/clients/"+clientID.String(), nil)
		w := httptest.NewRecorder()

		mockRes := dto.ClientResponse{ID: clientID, ClientName: "Test Client"}
		mockSvc.EXPECT().GetClientByID(gomock.Any(), clientID).Return(mockRes, nil).Times(1)

		r.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", w.Code)
		}
	})

	t.Run("GetAllClients", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/clients", nil)
		w := httptest.NewRecorder()

		mockRes := []dto.ClientResponse{{ID: clientID, ClientName: "Test Client"}}
		mockSvc.EXPECT().GetAllClients(gomock.Any()).Return(mockRes, nil).Times(1)

		r.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", w.Code)
		}
	})

	t.Run("UpdateClient", func(t *testing.T) {
		reqBody := dto.ClientRequest{ID: clientID, ClientName: "Updated"}
		body, _ := json.Marshal(reqBody)
		req := httptest.NewRequest(http.MethodPut, "/clients/"+clientID.String(), bytes.NewBuffer(body))
		w := httptest.NewRecorder()

		mockSvc.EXPECT().UpdateClient(gomock.Any(), reqBody).Return(nil).Times(1)

		r.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", w.Code)
		}
	})

	t.Run("DeleteClient", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodDelete, "/clients/"+clientID.String(), nil)
		w := httptest.NewRecorder()

		mockSvc.EXPECT().DeleteClient(gomock.Any(), clientID).Return(nil).Times(1)

		r.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", w.Code)
		}
	})
}
