package models

import (
	"github.com/google/uuid"
)

type Client struct {
	ID            uuid.UUID `db:"id" json:"id"`
	ClientName    string    `db:"client_name" json:"client_name"`
	ClientSecret  string    `db:"client_secret" json:"client_secret"`
	BaseURL       string    `db:"base_url" json:"base_url"`
	Description   string    `db:"description" json:"description"`
	ImageLocation string    `db:"image_location" json:"image_location"`
	OldSecret     string    `db:"old_secret" json:"old_secret"`
}
