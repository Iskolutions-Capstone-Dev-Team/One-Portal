package service_test

import (
	"context"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/service"
	"github.com/jmoiron/sqlx"
)

func TestRefreshTokenServiceCRUD(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to create sqlmock: %v", err)
	}
	defer db.Close()

	xdb := sqlx.NewDb(db, "sqlmock")
	repo := repository.NewAuthRepository(xdb)
	svc := service.NewAuthService(repo)

	ctx := context.Background()
	now := time.Now().UTC().Truncate(time.Second)
	rt := models.RefreshToken{
		Token:     "refresh-token-123",
		UserID:    []byte("user-id-16-byte"),
		ExpiresAt: now.Add(1 * time.Hour),
	}

	mock.ExpectExec(regexp.QuoteMeta(
		`INSERT INTO refresh_tokens (token, user_id, expires_at) 
		VALUES (?, ?, ?)`,
	)).WithArgs(rt.Token, rt.UserID, rt.ExpiresAt).
		WillReturnResult(sqlmock.NewResult(1, 1))

	if err := svc.CreateToken(ctx, rt); err != nil {
		t.Fatalf("CreateToken failed: %v", err)
	}

	rows := sqlmock.NewRows([]string{
		"token", "user_id", "expires_at", "created_at", "updated_at",
	}).AddRow(rt.Token, rt.UserID, rt.ExpiresAt, now, now)

	query := `SELECT token, user_id, expires_at, created_at, updated_at
		FROM refresh_tokens
		WHERE token = ?`
	mock.ExpectQuery(regexp.QuoteMeta(query)).
		WithArgs(rt.Token).
		WillReturnRows(rows)

	saved, err := svc.GetToken(ctx, rt.Token)
	if err != nil {
		t.Fatalf("GetToken failed: %v", err)
	}
	if saved.Token != rt.Token {
		t.Fatalf(
			"GetToken returned token=%q wanted=%q",
			saved.Token, rt.Token,
		)
	}

	newExpiry := now.Add(2 * time.Hour)
	queryUpdate := `UPDATE refresh_tokens
		SET expires_at = ?, updated_at = NOW()
		WHERE token = ?`
	mock.ExpectExec(regexp.QuoteMeta(queryUpdate)).
		WithArgs(newExpiry, rt.Token).
		WillReturnResult(sqlmock.NewResult(1, 1))

	if err := svc.UpdateToken(ctx, rt.Token, newExpiry); err != nil {
		t.Fatalf("UpdateToken failed: %v", err)
	}

	delQuery := `DELETE FROM refresh_tokens WHERE token = ?`
	mock.ExpectExec(regexp.QuoteMeta(delQuery)).
		WithArgs(rt.Token).
		WillReturnResult(sqlmock.NewResult(1, 1))

	if err := svc.DeleteToken(ctx, rt.Token); err != nil {
		t.Fatalf("DeleteToken failed: %v", err)
	}

	queryDeleteExpired := `DELETE FROM refresh_tokens WHERE expires_at <= ?`
	mock.ExpectExec(regexp.QuoteMeta(queryDeleteExpired)).
		WithArgs(sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(0, 2))

	count, err := svc.DeleteExpiredTokens(ctx, now)
	if err != nil {
		t.Fatalf("DeleteExpiredTokens failed: %v", err)
	}
	if count != 2 {
		t.Fatalf("DeleteExpiredTokens rows=%d want=2", count)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("unmet expectations: %v", err)
	}
}
