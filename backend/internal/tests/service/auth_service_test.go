package service_test

import (
	"context"
	"testing"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/tests/mocks"
	"go.uber.org/mock/gomock"
)

func TestAuthService(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mocks.NewMockAuthRepository(ctrl)
	svc := service.NewAuthService(mockRepo)

	ctx := context.Background()
	now := time.Now()

	rt := models.RefreshToken{
		Token:     "token-123",
		UserID:    []byte("user-id"),
		ExpiresAt: now.Add(1 * time.Hour),
	}

	mockRepo.EXPECT().CreateToken(ctx, rt).Return(nil).Times(1)
	if err := svc.CreateToken(ctx, rt); err != nil {
		t.Fatalf("CreateToken failed: %v", err)
	}

	mockRepo.EXPECT().GetToken(ctx, rt.Token).Return(rt, nil).Times(1)
	if _, err := svc.GetToken(ctx, rt.Token); err != nil {
		t.Fatalf("GetToken failed: %v", err)
	}

	mockRepo.EXPECT().UpdateToken(ctx, rt.Token, now.Add(2*time.Hour)).Return(nil).Times(1)
	if err := svc.UpdateToken(ctx, rt.Token, now.Add(2*time.Hour)); err != nil {
		t.Fatalf("UpdateToken failed: %v", err)
	}

	mockRepo.EXPECT().DeleteToken(ctx, rt.Token).Return(nil).Times(1)
	if err := svc.DeleteToken(ctx, rt.Token); err != nil {
		t.Fatalf("DeleteToken failed: %v", err)
	}

	mockRepo.EXPECT().DeleteExpiredTokens(ctx, now).Return(int64(2), nil).Times(1)
	if _, err := svc.DeleteExpiredTokens(ctx, now); err != nil {
		t.Fatalf("DeleteExpiredTokens failed: %v", err)
	}

	mockRepo.EXPECT().DeleteTokensByUserID(ctx, rt.UserID).Return(nil).Times(1)
	if err := svc.DeleteTokensByUserID(ctx, rt.UserID); err != nil {
		t.Fatalf("DeleteTokensByUserID failed: %v", err)
	}

	mockRepo.EXPECT().GetTokenByUserID(ctx, rt.UserID).Return(rt, nil).Times(1)
	if _, err := svc.GetTokenByUserID(ctx, rt.UserID); err != nil {
		t.Fatalf("GetTokenByUserID failed: %v", err)
	}
}
