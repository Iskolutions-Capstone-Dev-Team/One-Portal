package handler_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	v1 "github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/tests/mocks"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/tests/mocks"
	"github.com/gin-gonic/gin"
	"go.uber.org/mock/gomock"
)

// TestLogHandlerGetLogs exercises the log handler directly, bypassing
// route-level middleware (API key + JWT). Middleware correctness is
// verified separately via integration-style tests.
func TestLogHandlerGetLogs(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	gin.SetMode(gin.TestMode)

	logSvc := mocks.NewMockLogService(ctrl)
	logSvc.EXPECT().
		GetLogs(gomock.Any(), "", 20, 0).
		Return([]models.Log{{ID: 1, Actor: "test", Action: "x", Result: "ok"}}, nil).
		Times(1)

	h := v1.NewLogHandler(logSvc)
	r := gin.New()
	r.GET("/logs", h.HandleGetLogs)

	req := httptest.NewRequest(http.MethodGet, "/logs", nil)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf(
			"expected status 200, got %d; body=%s",
			w.Code, w.Body.String(),
		)
	}
}
