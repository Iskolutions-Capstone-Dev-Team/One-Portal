package repository_test

import (
	"context"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/repository"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

func TestUserAccessRepository(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to create sqlmock: %v", err)
	}
	defer db.Close()

	xdb := sqlx.NewDb(db, "sqlmock")
	repo := repository.NewUserAccessRepository(xdb)

	ctx := context.Background()
	userID := uuid.New()
	clientID := uuid.New()
	uIDBytes, _ := userID.MarshalBinary()
	cIDBytes, _ := clientID.MarshalBinary()

	t.Run("GrantAccess", func(t *testing.T) {
		access := models.UserAccess{UserID: userID, ClientID: clientID}

		mock.ExpectExec(regexp.QuoteMeta(`INSERT INTO user_access (user_id, client_id) VALUES (?, ?)`)).
			WithArgs(uIDBytes, cIDBytes).
			WillReturnResult(sqlmock.NewResult(1, 1))

		err := repo.GrantAccess(ctx, access)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
	})

	t.Run("RevokeAccess", func(t *testing.T) {
		mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM user_access WHERE user_id = ? AND client_id = ?`)).
			WithArgs(uIDBytes, cIDBytes).
			WillReturnResult(sqlmock.NewResult(1, 1))

		err := repo.RevokeAccess(ctx, userID, clientID)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
	})

	t.Run("GetAccessByUserID", func(t *testing.T) {
		now := time.Now()
		rows := sqlmock.NewRows([]string{"user_id", "client_id", "created_at"}).
			AddRow(uIDBytes, cIDBytes, now)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT user_id, client_id, created_at FROM user_access WHERE user_id = ?`)).
			WithArgs(uIDBytes).
			WillReturnRows(rows)

		accesses, err := repo.GetAccessByUserID(ctx, userID)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if len(accesses) != 1 {
			t.Errorf("expected 1 access, got %d", len(accesses))
		}
	})

	t.Run("GetAccessByClientID", func(t *testing.T) {
		now := time.Now()
		rows := sqlmock.NewRows([]string{"user_id", "client_id", "created_at"}).
			AddRow(uIDBytes, cIDBytes, now)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT user_id, client_id, created_at FROM user_access WHERE client_id = ?`)).
			WithArgs(cIDBytes).
			WillReturnRows(rows)

		accesses, err := repo.GetAccessByClientID(ctx, clientID)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if len(accesses) != 1 {
			t.Errorf("expected 1 access, got %d", len(accesses))
		}
	})

	t.Run("CheckAccess", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{"COUNT(*)"}).AddRow(1)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT COUNT(*) FROM user_access WHERE user_id = ? AND client_id = ?`)).
			WithArgs(uIDBytes, cIDBytes).
			WillReturnRows(rows)

		hasAccess, err := repo.CheckAccess(ctx, userID, clientID)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if !hasAccess {
			t.Errorf("expected true, got %v", hasAccess)
		}
	})

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}
