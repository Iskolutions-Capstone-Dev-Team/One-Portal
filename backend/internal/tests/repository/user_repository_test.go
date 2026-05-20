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

func TestUserRepository(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to create sqlmock: %v", err)
	}
	defer db.Close()

	xdb := sqlx.NewDb(db, "sqlmock")
	repo := repository.NewUserRepository(xdb)

	ctx := context.Background()
	userID := uuid.New()
	idBytes, _ := userID.MarshalBinary()

	t.Run("CreateUser", func(t *testing.T) {
		user := models.User{
			ID:         userID,
			Username:   "testuser",
			FirstName:  "John",
			MiddleName: "A",
			LastName:   "Doe",
			NameSuffix: "Jr",
			Email:      "test@example.com",
		}

		mock.ExpectExec(regexp.QuoteMeta(`INSERT INTO users (id, username, first_name, middle_name, last_name, name_suffix, email) VALUES (?, ?, ?, ?, ?, ?, ?)`)).
			WithArgs(idBytes, user.Username, user.FirstName, user.MiddleName, user.LastName, user.NameSuffix, user.Email).
			WillReturnResult(sqlmock.NewResult(1, 1))

		err := repo.CreateUser(ctx, user)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
	})

	t.Run("GetUserByID", func(t *testing.T) {
		now := time.Now()
		rows := sqlmock.NewRows([]string{"id", "username", "first_name", "middle_name", "last_name", "name_suffix", "email", "created_at", "updated_at", "last_login"}).
			AddRow(idBytes, "testuser", "John", "A", "Doe", "Jr", "test@example.com", now, now, now)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, username, first_name, middle_name, last_name, name_suffix, email, created_at, updated_at, last_login FROM users WHERE id = ?`)).
			WithArgs(idBytes).
			WillReturnRows(rows)

		user, err := repo.GetUserByID(ctx, userID)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if user.ID != userID {
			t.Errorf("expected ID %v, got %v", userID, user.ID)
		}
	})

	t.Run("UpdateUser", func(t *testing.T) {
		user := models.User{
			FirstName:  "Jane",
			MiddleName: "B",
			LastName:   "Smith",
			NameSuffix: "Sr",
		}

		mock.ExpectExec(regexp.QuoteMeta(`UPDATE users SET first_name = ?, middle_name = ?, last_name = ?, name_suffix = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)).
			WithArgs(user.FirstName, user.MiddleName, user.LastName, user.NameSuffix, idBytes).
			WillReturnResult(sqlmock.NewResult(1, 1))

		err := repo.UpdateUser(ctx, userID, user)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
	})

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}
