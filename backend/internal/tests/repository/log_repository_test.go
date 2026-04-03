package repository_test

import (
	"context"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/repository"
	"github.com/jmoiron/sqlx"
)

func TestLogRepositoryCRUD(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to create sqlmock: %v", err)
	}
	defer db.Close()
	// Log operations are async, so order might vary
	mock.MatchExpectationsInOrder(false)

	xdb := sqlx.NewDb(db, "sqlmock")
	repo := repository.NewLogRepository(xdb, 10)
	defer repo.Close()

	ctx := context.Background()
	now := time.Now().UTC().Truncate(time.Second)
	lg := models.Log{
		Actor:     "test-actor",
		Action:    "test-action",
		Result:    "success",
		CreatedAt: now,
	}

	// CreateLog is async
	insertQuery := `(?i)\s*INSERT\s+INTO\s+logs\s+` +
		`\(actor,\s+action,\s+result,\s+created_at\)\s+` +
		`VALUES\s+\(\?,\s+\?,\s+\?,\s+\?\)\s*`
	mock.ExpectExec(insertQuery).
		WithArgs(lg.Actor, lg.Action, lg.Result, sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(1, 1))

	if err := repo.CreateLog(ctx, lg); err != nil {
		t.Fatalf("CreateLog failed: %v", err)
	}

	// GetLogs test
	rows := sqlmock.NewRows(
		[]string{"id", "actor", "action", "result", "created_at"},
	).AddRow(1, lg.Actor, lg.Action, lg.Result, lg.CreatedAt)

	getQuery := `(?i)\s*SELECT\s+id,\s+actor,\s+action,\s+result,\s+` +
		`created_at\s+FROM\s+logs\s+WHERE\s+actor\s+LIKE\s+\?\s+` +
		`ORDER\s+BY\s+created_at\s+DESC\s+LIMIT\s+\?\s+OFFSET\s+\?\s*`
	mock.ExpectQuery(getQuery).
		WithArgs("%"+lg.Actor+"%", 10, 0).
		WillReturnRows(rows)

	logs, err := repo.GetLogs(ctx, lg.Actor, 10, 0)
	if err != nil {
		t.Fatalf("GetLogs failed: %v", err)
	}
	if len(logs) != 1 {
		t.Fatalf("expected 1 log, got %d", len(logs))
	}

	// Give it a bit for the async call to settle if needed,
	// or ExpectationsWereMet will wait
	time.Sleep(50 * time.Millisecond)

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("unmet expectations: %v", err)
	}
}
