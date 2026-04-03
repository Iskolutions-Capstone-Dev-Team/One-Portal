package repository

import (
	"context"
	"database/sql"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/jmoiron/sqlx"
)

type AuthRepository interface {
	CreateToken(ctx context.Context, token models.RefreshToken) error
	GetToken(ctx context.Context, token string) (models.RefreshToken, error)
	UpdateToken(ctx context.Context, token string, expiresAt time.Time) error
	DeleteToken(ctx context.Context, token string) error
	DeleteTokensByUserID(ctx context.Context, userID []byte) error
	GetTokenByUserID(ctx context.Context, userID []byte) (models.RefreshToken, error)
	DeleteExpiredTokens(ctx context.Context, at time.Time) (int64, error)
}

type authRepository struct {
	db *sqlx.DB
}

func NewAuthRepository(db *sqlx.DB) AuthRepository {
	return &authRepository{db: db}
}

func (r *authRepository) CreateToken(
	ctx context.Context,
	token models.RefreshToken,
) error {
	q := `INSERT INTO refresh_tokens
		(token, user_id, expires_at)
		VALUES (:token, :user_id, :expires_at)`

	_, err := r.db.NamedExecContext(ctx, q, token)
	return err
}

func (r *authRepository) GetToken(
	ctx context.Context,
	token string,
) (models.RefreshToken, error) {
	q := `SELECT token, user_id, expires_at, created_at, updated_at
		FROM refresh_tokens
		WHERE token = ?`

	var rt models.RefreshToken
	err := r.db.GetContext(ctx, &rt, q, token)
	if err != nil {
		if err == sql.ErrNoRows {
			return models.RefreshToken{}, err
		}
		return models.RefreshToken{}, err
	}

	return rt, nil
}

func (r *authRepository) UpdateToken(
	ctx context.Context,
	token string,
	expiresAt time.Time,
) error {
	q := `UPDATE refresh_tokens
		SET expires_at = ?, updated_at = NOW()
		WHERE token = ?`

	res, err := r.db.ExecContext(ctx, q, expiresAt, token)
	if err != nil {
		return err
	}

	_, err = res.RowsAffected()
	return err
}

func (r *authRepository) DeleteToken(
	ctx context.Context,
	token string,
) error {
	q := `DELETE FROM refresh_tokens WHERE token = ?`
	_, err := r.db.ExecContext(ctx, q, token)
	return err
}

func (r *authRepository) DeleteTokensByUserID(
	ctx context.Context,
	userID []byte,
) error {
	q := `DELETE FROM refresh_tokens WHERE user_id = ?`
	_, err := r.db.ExecContext(ctx, q, userID)
	return err
}

func (r *authRepository) GetTokenByUserID(
	ctx context.Context,
	userID []byte,
) (models.RefreshToken, error) {
	q := `SELECT token, user_id, expires_at, created_at, updated_at
		FROM refresh_tokens
		WHERE user_id = ?
		ORDER BY created_at DESC
		LIMIT 1`

	var rt models.RefreshToken
	err := r.db.GetContext(ctx, &rt, q, userID)
	return rt, err
}

func (r *authRepository) DeleteExpiredTokens(
	ctx context.Context,
	at time.Time,
) (int64, error) {
	q := `DELETE FROM refresh_tokens WHERE expires_at <= ?`
	res, err := r.db.ExecContext(ctx, q, at)
	if err != nil {
		return 0, err
	}

	count, err := res.RowsAffected()
	if err != nil {
		return 0, err
	}

	return count, nil
}
