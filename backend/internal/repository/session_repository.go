package repository

import (
	"context"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/jmoiron/sqlx"
)

// SessionRepository defines database operations for user sessions.
type SessionRepository interface {
	CreateSession(ctx context.Context, s models.Session) error
	GetSession(ctx context.Context, id string) (models.Session, error)
	DeleteSession(ctx context.Context, id string) error
	DeleteExpiredSessions(ctx context.Context, now time.Time) (int64, error)
	UpdateSession(ctx context.Context, id string, exp time.Time) error
}

type sessionRepository struct {
	db *sqlx.DB
}

// NewSessionRepository creates a new instance of SessionRepository.
func NewSessionRepository(db *sqlx.DB) SessionRepository {
	return &sessionRepository{db: db}
}

// UpdateSession updates the expiration time of an existing session.
func (r *sessionRepository) UpdateSession(
	ctx context.Context,
	id string,
	exp time.Time,
) error {
	q := `UPDATE sessions SET expires_at = ?, updated_at = NOW()
		WHERE session_id = ?`
	_, err := r.db.ExecContext(ctx, q, exp, id)
	return err
}

// CreateSession inserts a new user session into the database.
func (r *sessionRepository) CreateSession(
	ctx context.Context,
	s models.Session,
) error {
	q := `INSERT INTO sessions (session_id, user_id, expires_at)
		VALUES (?, ?, ?)`
	_, err := r.db.ExecContext(ctx, q, s.SessionID, s.UserID, s.ExpiresAt)
	return err
}

// GetSession retrieves an active user session by its ID.
func (r *sessionRepository) GetSession(
	ctx context.Context,
	id string,
) (models.Session, error) {
	q := `SELECT session_id, user_id, expires_at, created_at, updated_at
		FROM sessions
		WHERE session_id = ?`
	var s models.Session
	err := r.db.GetContext(ctx, &s, q, id)
	return s, err
}

// DeleteSession removes a user session from the database.
func (r *sessionRepository) DeleteSession(
	ctx context.Context,
	id string,
) error {
	q := `DELETE FROM sessions WHERE session_id = ?`
	_, err := r.db.ExecContext(ctx, q, id)
	return err
}

// DeleteExpiredSessions cleans up expired sessions from the database.
func (r *sessionRepository) DeleteExpiredSessions(
	ctx context.Context,
	now time.Time,
) (int64, error) {
	q := `DELETE FROM sessions WHERE expires_at <= ?`
	res, err := r.db.ExecContext(ctx, q, now)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}
