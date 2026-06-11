package models

import "time"

// Session represents a user session in the portal database.
type Session struct {
	SessionID string    `db:"session_id"`
	UserID    []byte    `db:"user_id"`
	ExpiresAt time.Time `db:"expires_at"`
	CreatedAt time.Time `db:"created_at"`
	UpdatedAt time.Time `db:"updated_at"`
}
