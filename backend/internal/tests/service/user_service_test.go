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

func TestUserService(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mocks.NewMockUserRepository(ctrl)
	svc := service.NewUserService(mockRepo)

	ctx := context.Background()
	userID := uuid.New()

	t.Run("CreateUser", func(t *testing.T) {
		user := models.User{ID: userID, Email: "test@example.com"}
		mockRepo.EXPECT().CreateUser(ctx, user).Return(nil).Times(1)

		err := svc.CreateUser(ctx, user)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
	})

	t.Run("CreateUserFromMe", func(t *testing.T) {
		me := dto.MeResponse{
			ID:        userID,
			Email:     "test@example.com",
			FirstName: "John",
		}
		expectedUser := models.User{
			ID:        me.ID,
			Username:  me.Email,
			Email:     me.Email,
			FirstName: me.FirstName,
		}
		mockRepo.EXPECT().CreateUser(ctx, expectedUser).Return(nil).Times(1)

		err := svc.CreateUserFromMe(ctx, me)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
	})

	t.Run("GetUserByID", func(t *testing.T) {
		expectedUser := models.User{ID: userID, Email: "test@example.com"}
		mockRepo.EXPECT().GetUserByID(ctx, userID).Return(expectedUser, nil).Times(1)

		user, err := svc.GetUserByID(ctx, userID)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if user.ID != userID {
			t.Errorf("expected ID %v, got %v", userID, user.ID)
		}
	})

	t.Run("UpdateUserName", func(t *testing.T) {
		req := dto.UpdateUserNameRequest{
			FirstName: "Jane",
			LastName:  "Doe",
		}
		expectedUser := models.User{
			FirstName: req.FirstName,
			LastName:  req.LastName,
		}
		mockRepo.EXPECT().UpdateUser(ctx, userID, expectedUser).Return(nil).Times(1)

		err := svc.UpdateUserName(ctx, userID, req)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
	})
}
