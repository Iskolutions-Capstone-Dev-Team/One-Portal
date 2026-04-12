package repository

import (
	"context"
	"fmt"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type UserAccessRepository interface {
	GrantAccess(ctx context.Context, access models.UserAccess) error
	RevokeAccess(ctx context.Context, userID, clientID uuid.UUID) error
	GetAccessByUserID(ctx context.Context, userID uuid.UUID) ([]models.UserAccess, error)
	GetAccessByClientID(ctx context.Context, clientID uuid.UUID) ([]models.UserAccess, error)
	CheckAccess(ctx context.Context, userID, clientID uuid.UUID) (bool, error)
}

type userAccessRepository struct {
	db *sqlx.DB
}

func NewUserAccessRepository(db *sqlx.DB) UserAccessRepository {
	return &userAccessRepository{db: db}
}

func (r *userAccessRepository) GrantAccess(
	ctx context.Context,
	access models.UserAccess,
) error {
	q := `INSERT INTO user_access (user_id, client_id) VALUES (?, ?)`

	userIDBytes, _ := access.UserID.MarshalBinary()
	clientIDBytes, _ := access.ClientID.MarshalBinary()

	_, err := r.db.ExecContext(ctx, q, userIDBytes, clientIDBytes)
	if err != nil {
		return fmt.Errorf("[UserAccessRepo] GrantAccess: %v", err)
	}
	return nil
}

func (r *userAccessRepository) RevokeAccess(
	ctx context.Context,
	userID, clientID uuid.UUID,
) error {
	q := `DELETE FROM user_access WHERE user_id = ? AND client_id = ?`

	userIDBytes, _ := userID.MarshalBinary()
	clientIDBytes, _ := clientID.MarshalBinary()

	_, err := r.db.ExecContext(ctx, q, userIDBytes, clientIDBytes)
	if err != nil {
		return fmt.Errorf("[UserAccessRepo] RevokeAccess: %v", err)
	}
	return nil
}

func (r *userAccessRepository) GetAccessByUserID(
	ctx context.Context,
	userID uuid.UUID,
) ([]models.UserAccess, error) {
	q := `SELECT user_id, client_id, created_at FROM user_access 
		WHERE user_id = ?`

	userIDBytes, _ := userID.MarshalBinary()
	rows, err := r.db.QueryContext(ctx, q, userIDBytes)
	if err != nil {
		return nil, fmt.Errorf("[UserAccessRepo] GetByUserID: %v", err)
	}
	defer rows.Close()

	var accesses []models.UserAccess
	for rows.Next() {
		var access models.UserAccess
		var uID, cID []byte
		if err := rows.Scan(&uID, &cID, &access.CreatedAt); err != nil {
			return nil, fmt.Errorf("[UserAccessRepo] Scan: %v", err)
		}
		access.UserID, _ = uuid.FromBytes(uID)
		access.ClientID, _ = uuid.FromBytes(cID)
		accesses = append(accesses, access)
	}
	return accesses, nil
}

func (r *userAccessRepository) GetAccessByClientID(
	ctx context.Context,
	clientID uuid.UUID,
) ([]models.UserAccess, error) {
	q := `SELECT user_id, client_id, created_at FROM user_access 
		WHERE client_id = ?`

	clientIDBytes, _ := clientID.MarshalBinary()
	rows, err := r.db.QueryContext(ctx, q, clientIDBytes)
	if err != nil {
		return nil, fmt.Errorf("[UserAccessRepo] GetByClientID: %v", err)
	}
	defer rows.Close()

	var accesses []models.UserAccess
	for rows.Next() {
		var access models.UserAccess
		var uID, cID []byte
		if err := rows.Scan(&uID, &cID, &access.CreatedAt); err != nil {
			return nil, fmt.Errorf("[UserAccessRepo] Scan: %v", err)
		}
		access.UserID, _ = uuid.FromBytes(uID)
		access.ClientID, _ = uuid.FromBytes(cID)
		accesses = append(accesses, access)
	}
	return accesses, nil
}

func (r *userAccessRepository) CheckAccess(
	ctx context.Context,
	userID, clientID uuid.UUID,
) (bool, error) {
	q := `SELECT COUNT(*) FROM user_access WHERE user_id = ? AND client_id = ?`

	userIDBytes, _ := userID.MarshalBinary()
	clientIDBytes, _ := clientID.MarshalBinary()

	var count int
	err := r.db.GetContext(ctx, &count, q, userIDBytes, clientIDBytes)
	if err != nil {
		return false, fmt.Errorf("[UserAccessRepo] CheckAccess: %v", err)
	}
	return count > 0, nil
}
