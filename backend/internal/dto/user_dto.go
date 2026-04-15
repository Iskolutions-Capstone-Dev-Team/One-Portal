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

type UpdateUserNameRequest struct {
	FirstName  string `json:"first_name" binding:"required"`
	MiddleName string `json:"middle_name"`
	LastName   string `json:"last_name" binding:"required"`
	NameSuffix string `json:"name_suffix"`
}

type UpdatePasswordByEmailRequest struct {
	Email       string `json:"email" binding:"required,email"`
	NewPassword string `json:"new_password" binding:"required"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=8"`
}
