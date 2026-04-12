package dto

import "github.com/google/uuid"

type UserAccessRequest struct {
	UserID   uuid.UUID `json:"user_id" binding:"required"`
	ClientID uuid.UUID `json:"client_id" binding:"required"`
}

type UserAccessResponse struct {
	UserID    uuid.UUID `json:"user_id"`
	ClientID  uuid.UUID `json:"client_id"`
	CreatedAt string    `json:"created_at"`
}
