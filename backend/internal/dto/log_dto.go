package dto

import "github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"

type LogListResponse struct {
	Logs []models.Log `json:"logs"`
}
