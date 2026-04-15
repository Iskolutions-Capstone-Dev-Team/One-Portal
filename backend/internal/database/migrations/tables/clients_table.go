package tables

import (
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/database/migrations"
)

var ClientsMigration = migrations.TableMigration{
	TableName: "clients",
	Steps: []migrations.MigrationStep{
		{
			ID: "create-clients-table",
			SQL: `
			CREATE TABLE IF NOT EXISTS clients (
				id BINARY(16) PRIMARY KEY,
				client_name VARCHAR(100) NOT NULL,
				client_secret VARCHAR(255) NOT NULL,
				base_url VARCHAR(255) NOT NULL,
				description TEXT,
				image_location VARCHAR(255),
				old_secret VARCHAR(255)
			);`,
		},
	},
}
