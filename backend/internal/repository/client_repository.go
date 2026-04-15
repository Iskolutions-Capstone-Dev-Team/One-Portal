package repository

import (
	"context"
	"fmt"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type ClientRepository interface {
	CreateClient(ctx context.Context, client models.Client) error
	GetClientByID(ctx context.Context, id uuid.UUID) (models.Client, error)
	GetAllClients(ctx context.Context) ([]models.Client, error)
	UpdateClient(ctx context.Context, client models.Client) error
	DeleteClient(ctx context.Context, id uuid.UUID) error
}

type clientRepository struct {
	db *sqlx.DB
}

func NewClientRepository(db *sqlx.DB) ClientRepository {
	return &clientRepository{db: db}
}

func (r *clientRepository) CreateClient(
	ctx context.Context,
	client models.Client,
) error {
	q := `INSERT INTO clients (id, client_name, client_secret, base_url, 
		description, image_location, old_secret) 
		VALUES (?, ?, ?, ?, ?, ?, ?)`

	idBytes, err := client.ID.MarshalBinary()
	if err != nil {
		return fmt.Errorf("[ClientRepo] MarshalID: %v", err)
	}

	_, err = r.db.ExecContext(ctx, q, idBytes, client.ClientName,
		client.ClientSecret, client.BaseURL, client.Description,
		client.ImageLocation, client.OldSecret)
	if err != nil {
		return fmt.Errorf("[ClientRepo] CreateClient: %v", err)
	}
	return nil
}

func (r *clientRepository) GetClientByID(
	ctx context.Context,
	id uuid.UUID,
) (models.Client, error) {
	q := `SELECT id, client_name, client_secret, base_url, description, 
		image_location, old_secret FROM clients WHERE id = ?`

	idBytes, err := id.MarshalBinary()
	if err != nil {
		return models.Client{}, fmt.Errorf("[ClientRepo] MarshalID: %v", err)
	}

	var client models.Client
	var idFromDB []byte
	row := r.db.QueryRowContext(ctx, q, idBytes)
	err = row.Scan(&idFromDB, &client.ClientName, &client.ClientSecret,
		&client.BaseURL, &client.Description, &client.ImageLocation,
		&client.OldSecret)
	if err != nil {
		return models.Client{}, fmt.Errorf("[ClientRepo] GetByID: %v", err)
	}

	client.ID, err = uuid.FromBytes(idFromDB)
	if err != nil {
		return models.Client{}, fmt.Errorf("[ClientRepo] FromBytes: %v", err)
	}

	return client, nil
}

func (r *clientRepository) GetAllClients(
	ctx context.Context,
) ([]models.Client, error) {
	q := `SELECT id, client_name, client_secret, base_url, description, 
		image_location, old_secret FROM clients`

	rows, err := r.db.QueryContext(ctx, q)
	if err != nil {
		return nil, fmt.Errorf("[ClientRepo] GetAll: %v", err)
	}
	defer rows.Close()

	var clients []models.Client
	for rows.Next() {
		var client models.Client
		var idFromDB []byte
		err := rows.Scan(&idFromDB, &client.ClientName, &client.ClientSecret,
			&client.BaseURL, &client.Description, &client.ImageLocation,
			&client.OldSecret)
		if err != nil {
			return nil, fmt.Errorf("[ClientRepo] ScanAll: %v", err)
		}
		client.ID, _ = uuid.FromBytes(idFromDB)
		clients = append(clients, client)
	}
	return clients, nil
}

func (r *clientRepository) UpdateClient(
	ctx context.Context,
	client models.Client,
) error {
	q := `UPDATE clients SET client_name = ?, client_secret = ?, 
		base_url = ?, description = ?, image_location = ?, 
		old_secret = ? WHERE id = ?`

	idBytes, err := client.ID.MarshalBinary()
	if err != nil {
		return fmt.Errorf("[ClientRepo] MarshalID: %v", err)
	}

	_, err = r.db.ExecContext(ctx, q, client.ClientName, client.ClientSecret,
		client.BaseURL, client.Description, client.ImageLocation,
		client.OldSecret, idBytes)
	if err != nil {
		return fmt.Errorf("[ClientRepo] Update: %v", err)
	}
	return nil
}

func (r *clientRepository) DeleteClient(
	ctx context.Context,
	id uuid.UUID,
) error {
	q := `DELETE FROM clients WHERE id = ?`

	idBytes, err := id.MarshalBinary()
	if err != nil {
		return fmt.Errorf("[ClientRepo] MarshalID: %v", err)
	}

	_, err = r.db.ExecContext(ctx, q, idBytes)
	if err != nil {
		return fmt.Errorf("[ClientRepo] Delete: %v", err)
	}
	return nil
}
