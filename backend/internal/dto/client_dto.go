package dto

import "github.com/google/uuid"

type ClientRequest struct {
	ID            uuid.UUID `json:"id"`
	ClientName    string    `json:"client_name"`
	ClientSecret  string    `json:"client_secret"`
	BaseURL       string    `json:"base_url"`
	Description   string    `json:"description"`
	ImageLocation string    `json:"image_location"`
	OldSecret     string    `json:"old_secret"`
}

type ClientResponse struct {
	ID            uuid.UUID `json:"id"`
	ClientName    string    `json:"client_name"`
	ClientSecret  string    `json:"client_secret"`
	BaseURL       string    `json:"base_url"`
	Description   string    `json:"description"`
	ImageLocation string    `json:"image_location"`
	ImageURL      string    `json:"image_url"`
}
