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
	mockSessionRepo := mocks.NewMockSessionRepository(ctrl)
	svc := service.NewAuthService(mockRepo, mockSessionRepo)

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

	// Test Session Methods
	sess := models.Session{
		SessionID: "sess-123",
		UserID:    []byte("user-id"),
		ExpiresAt: now.Add(1 * time.Hour),
	}

	mockSessionRepo.EXPECT().
		CreateSession(ctx, sess).
		Return(nil).
		Times(1)
	if err := svc.CreateSession(ctx, sess); err != nil {
		t.Fatalf("CreateSession failed: %v", err)
	}

	mockSessionRepo.EXPECT().
		GetSession(ctx, sess.SessionID).
		Return(sess, nil).
		Times(1)
	if _, err := svc.GetSession(ctx, sess.SessionID); err != nil {
		t.Fatalf("GetSession failed: %v", err)
	}

	mockSessionRepo.EXPECT().
		UpdateSession(ctx, sess.SessionID, now.Add(2*time.Hour)).
		Return(nil).
		Times(1)
	err := svc.UpdateSession(ctx, sess.SessionID, now.Add(2*time.Hour))
	if err != nil {
		t.Fatalf("UpdateSession failed: %v", err)
	}

	mockSessionRepo.EXPECT().
		DeleteSession(ctx, sess.SessionID).
		Return(nil).
		Times(1)
	if err := svc.DeleteSession(ctx, sess.SessionID); err != nil {
		t.Fatalf("DeleteSession failed: %v", err)
	}

	mockSessionRepo.EXPECT().
		DeleteExpiredSessions(ctx, now).
		Return(int64(1), nil).
		Times(1)
	if _, err := svc.DeleteExpiredSessions(ctx, now); err != nil {
		t.Fatalf("DeleteExpiredSessions failed: %v", err)
	}
}
