package models

import (
	"time"

	"github.com/google/uuid"
)

type UserAccess struct {
	UserID    uuid.UUID `db:"user_id" json:"user_id"`
	ClientID  uuid.UUID `db:"client_id" json:"client_id"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}
