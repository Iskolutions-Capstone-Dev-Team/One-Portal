package tables

import "github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/database/migrations"

var UsersMigration = migrations.TableMigration{
	TableName: "users",
	Steps: []migrations.MigrationStep{
		{
			ID: "create-users-table",
			SQL: `CREATE TABLE IF NOT EXISTS users (
				id BINARY(16) PRIMARY KEY,
				username VARCHAR(255) NOT NULL UNIQUE,
				first_name VARCHAR(50),
				middle_name VARCHAR(50),
				last_name VARCHAR(50),
				name_suffix VARCHAR(10),
				email VARCHAR(100) NOT NULL UNIQUE,
				created_at TIMESTAMP DEFAULT NOW(),
				updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
				last_login TIMESTAMP NULL
			);`,
		},
	},
}
