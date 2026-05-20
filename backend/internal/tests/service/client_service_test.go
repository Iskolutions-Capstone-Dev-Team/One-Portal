package service_test

import (
	"context"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/tests/mocks"
	"github.com/google/uuid"
	"go.uber.org/mock/gomock"
)

func TestClientService(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mocks.NewMockClientRepository(ctrl)
	svc := service.NewClientService(mockRepo, nil)

	ctx := context.Background()
	clientID := uuid.New()

	t.Run("CreateClient", func(t *testing.T) {
		req := dto.ClientRequest{
			ClientName: "Test Client",
		}
		mockRepo.EXPECT().CreateClient(ctx, gomock.Any()).Return(nil).Times(1)

		err := svc.CreateClient(ctx, req)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
	})

	t.Run("GetClientByID", func(t *testing.T) {
		client := models.Client{ID: clientID, ClientName: "Test Client"}
		mockRepo.EXPECT().GetClientByID(ctx, clientID).Return(client, nil).Times(1)

		res, err := svc.GetClientByID(ctx, clientID)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if res.ID != clientID {
			t.Errorf("expected ID %v, got %v", clientID, res.ID)
		}
	})

	t.Run("GetAllClients", func(t *testing.T) {
		clients := []models.Client{{ID: clientID, ClientName: "Test Client"}}
		mockRepo.EXPECT().GetAllClients(ctx).Return(clients, nil).Times(1)

		res, err := svc.GetAllClients(ctx)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if len(res) != 1 {
			t.Errorf("expected 1 client, got %d", len(res))
		}
	})

	t.Run("UpdateClient", func(t *testing.T) {
		req := dto.ClientRequest{ID: clientID, ClientName: "Updated"}
		client := models.Client{ID: clientID, ClientName: "Updated"}
		mockRepo.EXPECT().UpdateClient(ctx, client).Return(nil).Times(1)

		err := svc.UpdateClient(ctx, req)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
	})

	t.Run("DeleteClient", func(t *testing.T) {
		mockRepo.EXPECT().DeleteClient(ctx, clientID).Return(nil).Times(1)

		err := svc.DeleteClient(ctx, clientID)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
	})
}
