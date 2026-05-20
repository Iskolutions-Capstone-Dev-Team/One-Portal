package service_test

import (
	"context"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/tests/mocks"
	"github.com/google/uuid"
	"go.uber.org/mock/gomock"
)

func TestUserAccessService(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mocks.NewMockUserAccessRepository(ctrl)
	svc := service.NewUserAccessService(mockRepo)

	ctx := context.Background()
	userID := uuid.New()
	clientID := uuid.New()

	t.Run("GrantAccess", func(t *testing.T) {
		access := models.UserAccess{UserID: userID, ClientID: clientID}
		mockRepo.EXPECT().GrantAccess(ctx, access).Return(nil).Times(1)

		err := svc.GrantAccess(ctx, userID, clientID)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
	})

	t.Run("RevokeAccess", func(t *testing.T) {
		mockRepo.EXPECT().RevokeAccess(ctx, userID, clientID).Return(nil).Times(1)

		err := svc.RevokeAccess(ctx, userID, clientID)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
	})

	t.Run("GetUserAccesses", func(t *testing.T) {
		accesses := []models.UserAccess{{UserID: userID, ClientID: clientID}}
		mockRepo.EXPECT().GetAccessByUserID(ctx, userID).Return(accesses, nil).Times(1)

		res, err := svc.GetUserAccesses(ctx, userID)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if len(res) != 1 {
			t.Errorf("expected 1 access, got %d", len(res))
		}
	})

	t.Run("GetClientAccesses", func(t *testing.T) {
		accesses := []models.UserAccess{{UserID: userID, ClientID: clientID}}
		mockRepo.EXPECT().GetAccessByClientID(ctx, clientID).Return(accesses, nil).Times(1)

		res, err := svc.GetClientAccesses(ctx, clientID)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if len(res) != 1 {
			t.Errorf("expected 1 access, got %d", len(res))
		}
	})

	t.Run("HasAccess", func(t *testing.T) {
		mockRepo.EXPECT().CheckAccess(ctx, userID, clientID).Return(true, nil).Times(1)

		hasAccess, err := svc.HasAccess(ctx, userID, clientID)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if !hasAccess {
			t.Errorf("expected true, got %v", hasAccess)
		}
	})
}
