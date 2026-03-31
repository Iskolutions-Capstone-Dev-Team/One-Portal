package tables

import "github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/database/migrations"

var SessionsMigration = migrations.TableMigration{
	TableName: "sessions",
	Steps: []migrations.MigrationStep{
		{
			ID: "create-sessions-table",
			SQL: `CREATE TABLE IF NOT EXISTS sessions (
				session_id VARCHAR(255) PRIMARY KEY,
				user_id BINARY(16) NOT NULL,
				expires_at TIMESTAMP NOT NULL,
				created_at TIMESTAMP DEFAULT NOW(),
				updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
				FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
			);`,
		},
	},
}