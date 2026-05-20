package service_test

import (
	"context"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/tests/mocks"
	"go.uber.org/mock/gomock"
)

func TestLogService(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mocks.NewMockLogRepository(ctrl)
	svc := service.NewLogService(mockRepo)

	ctx := context.Background()

	// 1. Test LogAction
	actor := "test-actor"
	action := "test-action"
	mockRepo.EXPECT().CreateLog(ctx, gomock.Any()).Return(nil).Times(1)

	if err := svc.LogAction(ctx, actor, action); err != nil {
		t.Fatalf("LogAction failed: %v", err)
	}

	// 2. Test GetLogs
	mockLogs := []models.Log{
		{ID: 1, Actor: actor, Action: action, Result: "success"},
	}
	mockRepo.EXPECT().GetLogs(ctx, actor, 10, 0).Return(mockLogs, nil).Times(1)

	logs, err := svc.GetLogs(ctx, actor, 10, 0)
	if err != nil {
		t.Fatalf("GetLogs failed: %v", err)
	}
	if len(logs) != 1 {
		t.Fatalf("Expected 1 log, got %d", len(logs))
	}
}
