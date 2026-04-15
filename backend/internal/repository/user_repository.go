package repository

import (
	"context"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type UserRepository interface {
	CreateUser(ctx context.Context, user models.User) error
	GetUserByID(ctx context.Context, id uuid.UUID) (models.User, error)
	UpdateUser(ctx context.Context, id uuid.UUID, user models.User) error
}

type userRepository struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) CreateUser(ctx context.Context, user models.User) error {
	q := `INSERT INTO users (id, username, first_name, middle_name, last_name, 
		name_suffix, email) VALUES (?, ?, ?, ?, ?, ?, ?)`
	
	idBytes, err := user.ID.MarshalBinary()
	if err != nil {
		return err
	}

	_, err = r.db.ExecContext(ctx, q, idBytes, user.Username, user.FirstName, 
		user.MiddleName, user.LastName, user.NameSuffix, user.Email)
	return err
}

func (r *userRepository) GetUserByID(
	ctx context.Context, 
	id uuid.UUID,
) (models.User, error) {
	q := `SELECT id, username, first_name, middle_name, last_name, name_suffix, 
		email, created_at, updated_at, last_login FROM users WHERE id = ?`
	
	idBytes, err := id.MarshalBinary()
	if err != nil {
		return models.User{}, err
	}

	var user models.User
	var idFromDB []byte
	row := r.db.QueryRowContext(ctx, q, idBytes)
	err = row.Scan(
		&idFromDB, &user.Username, &user.FirstName, &user.MiddleName, 
		&user.LastName, &user.NameSuffix, &user.Email, &user.CreatedAt, 
		&user.UpdatedAt, &user.LastLogin,
	)
	if err != nil {
		return models.User{}, err
	}

	user.ID, err = uuid.FromBytes(idFromDB)
	if err != nil {
		return models.User{}, err
	}

	return user, nil
}

func (r *userRepository) UpdateUser(
	ctx context.Context, 
	id uuid.UUID, 
	user models.User,
) error {
	q := `UPDATE users SET first_name = ?, middle_name = ?, last_name = ?, 
		name_suffix = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
	
	idBytes, err := id.MarshalBinary()
	if err != nil {
		return err
	}

	_, err = r.db.ExecContext(ctx, q, user.FirstName, user.MiddleName, 
		user.LastName, user.NameSuffix, idBytes)
	return err
}
