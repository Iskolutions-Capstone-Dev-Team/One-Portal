package tables

import "github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/database/migrations"

var RefreshTokensMigration = migrations.TableMigration{
	TableName: "refresh_tokens",
	Steps: []migrations.MigrationStep{
		{
			ID: "create-refresh-tokens-table",
			SQL: `CREATE TABLE IF NOT EXISTS refresh_tokens (
				token VARCHAR(255) PRIMARY KEY,
				user_id BINARY(16) NOT NULL,
				expires_at TIMESTAMP NOT NULL,
				created_at TIMESTAMP DEFAULT NOW(),
				updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
				FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
			);`,
		},
	},
}
