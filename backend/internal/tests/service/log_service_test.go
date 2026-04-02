package service_test

import (
	"context"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/service"
	"github.com/jmoiron/sqlx"
)

func TestLogServiceCRUD(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to create sqlmock: %v", err)
	}
	defer db.Close()
	// Log operations are async
	mock.MatchExpectationsInOrder(false)

	xdb := sqlx.NewDb(db, "sqlmock")
	// Increase buffer to avoid overflow error
	repo := repository.NewLogRepository(xdb, 100)
	svc := service.NewLogService(repo)
	defer repo.Close()

	ctx := context.Background()
	lg := models.Log{
		Actor:  "test-actor",
		Action: "test-action",
	}

	// LogAction is async
	insertQuery := `(?i)\s*INSERT\s+INTO\s+logs\s+` +
		`\(actor,\s+action,\s+result,\s+created_at\)\s+` +
		`VALUES\s+\(\?,\s+\?,\s+\?,\s+\?\)\s*`
	mock.ExpectExec(insertQuery).
		WithArgs(lg.Actor, lg.Action, sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(1, 1))

	if err := svc.LogAction(ctx, lg.Actor, lg.Action); err != nil {
		t.Fatalf("LogAction failed: %v", err)
	}

	// GetLogs test
	now := time.Now()
	rows := sqlmock.NewRows(
		[]string{"id", "actor", "action", "result", "created_at"},
	).AddRow(1, lg.Actor, lg.Action, "success", now)

	getQuery := `(?i)\s*SELECT\s+id,\s+actor,\s+action,\s+` +
		`result,\s+created_at\s+FROM\s+logs\s+WHERE\s+` +
		`actor\s+LIKE\s+\?\s+ORDER\s+BY\s+created_at\s+DESC\s+` +
		`LIMIT\s+\?\s+OFFSET\s+\?\s*`
	mock.ExpectQuery(getQuery).
		WithArgs("%"+lg.Actor+"%", 10, 0).
		WillReturnRows(rows)

	logs, err := svc.GetLogs(ctx, lg.Actor, 10, 0)
	if err != nil {
		t.Fatalf("GetLogs failed: %v", err)
	}
	if len(logs) != 1 {
		t.Fatalf("expected 1 log, got %d", len(logs))
	}

	time.Sleep(50 * time.Millisecond)

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("unmet expectations: %v", err)
	}
}
