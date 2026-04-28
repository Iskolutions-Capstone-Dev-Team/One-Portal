package repository_test

import (
	"context"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/repository"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

func TestClientRepository(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to create sqlmock: %v", err)
	}
	defer db.Close()

	xdb := sqlx.NewDb(db, "sqlmock")
	repo := repository.NewClientRepository(xdb)

	ctx := context.Background()
	clientID := uuid.New()
	idBytes, _ := clientID.MarshalBinary()

	t.Run("CreateClient", func(t *testing.T) {
		client := models.Client{
			ID:            clientID,
			ClientName:    "Test Client",
			ClientSecret:  "secret",
			BaseURL:       "http://localhost",
			Description:   "desc",
			ImageLocation: "img",
			OldSecret:     "old",
		}

		mock.ExpectExec(regexp.QuoteMeta(`INSERT INTO clients (id, client_name, client_secret, base_url, description, image_location, old_secret) VALUES (?, ?, ?, ?, ?, ?, ?)`)).
			WithArgs(idBytes, client.ClientName, client.ClientSecret, client.BaseURL, client.Description, client.ImageLocation, client.OldSecret).
			WillReturnResult(sqlmock.NewResult(1, 1))

		err := repo.CreateClient(ctx, client)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
	})

	t.Run("GetClientByID", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{"id", "client_name", "client_secret", "base_url", "description", "image_location", "old_secret"}).
			AddRow(idBytes, "Test Client", "secret", "http://localhost", "desc", "img", "old")

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, client_name, client_secret, base_url, description, image_location, old_secret FROM clients WHERE id = ?`)).
			WithArgs(idBytes).
			WillReturnRows(rows)

		client, err := repo.GetClientByID(ctx, clientID)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if client.ID != clientID {
			t.Errorf("expected ID %v, got %v", clientID, client.ID)
		}
	})

	t.Run("GetAllClients", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{"id", "client_name", "client_secret", "base_url", "description", "image_location", "old_secret"}).
			AddRow(idBytes, "Test Client", "secret", "http://localhost", "desc", "img", "old")

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, client_name, client_secret, base_url, description, image_location, old_secret FROM clients`)).
			WillReturnRows(rows)

		clients, err := repo.GetAllClients(ctx)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if len(clients) != 1 {
			t.Errorf("expected 1 client, got %d", len(clients))
		}
	})

	t.Run("UpdateClient", func(t *testing.T) {
		client := models.Client{
			ID:            clientID,
			ClientName:    "Updated",
			ClientSecret:  "new_secret",
			BaseURL:       "http://localhost:8080",
			Description:   "new desc",
			ImageLocation: "new img",
			OldSecret:     "secret",
		}

		mock.ExpectExec(regexp.QuoteMeta(`UPDATE clients SET client_name = ?, client_secret = ?, base_url = ?, description = ?, image_location = ?, old_secret = ? WHERE id = ?`)).
			WithArgs(client.ClientName, client.ClientSecret, client.BaseURL, client.Description, client.ImageLocation, client.OldSecret, idBytes).
			WillReturnResult(sqlmock.NewResult(1, 1))

		err := repo.UpdateClient(ctx, client)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
	})

	t.Run("DeleteClient", func(t *testing.T) {
		mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM clients WHERE id = ?`)).
			WithArgs(idBytes).
			WillReturnResult(sqlmock.NewResult(1, 1))

		err := repo.DeleteClient(ctx, clientID)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
	})

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}
