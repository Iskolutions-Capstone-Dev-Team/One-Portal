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

type ClientDetailedAccessResponse struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	Description   string `json:"description"`
	ImageLocation string `json:"image_location"`
	BaseURL       string `json:"base_url"`
}
