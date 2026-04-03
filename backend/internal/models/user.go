package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID         uuid.UUID `db:"id" json:"id"`
	Username   string    `db:"username" json:"username"`
	FirstName  string    `db:"first_name" json:"first_name"`
	MiddleName string    `db:"middle_name" json:"middle_name"`
	LastName   string    `db:"last_name" json:"last_name"`
	NameSuffix string    `db:"name_suffix" json:"name_suffix"`
	Email      string    `db:"email" json:"email"`
	CreatedAt  time.Time `db:"created_at" json:"created_at"`
	UpdatedAt  time.Time `db:"updated_at" json:"updated_at"`
	LastLogin  *time.Time `db:"last_login" json:"last_login"`
}
