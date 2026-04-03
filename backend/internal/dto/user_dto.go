package dto

import "github.com/google/uuid"

type UserRequest struct {
	ID         uuid.UUID `json:"id"`
	Username   string    `json:"username"`
	FirstName  string    `json:"first_name"`
	MiddleName string    `json:"middle_name"`
	LastName   string    `json:"last_name"`
	NameSuffix string    `json:"name_suffix"`
	Email      string    `json:"email"`
}

type UserResponse struct {
	ID         uuid.UUID `json:"id"`
	Username   string    `json:"username"`
	FirstName  string    `json:"first_name"`
	MiddleName string    `json:"middle_name"`
	LastName   string    `json:"last_name"`
	NameSuffix string    `json:"name_suffix"`
	Email      string    `json:"email"`
}

type MeResponse struct {
	ID             uuid.UUID `json:"id"`
	FirstName      string    `json:"first_name"`
	MiddleName     string    `json:"middle_name"`
	LastName       string    `json:"last_name"`
	NameSuffix     string    `json:"name_suffix"`
	Email          string    `json:"email"`
	AllowedClients []string  `json:"allowed_clients"`
}
