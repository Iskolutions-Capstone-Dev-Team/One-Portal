package tables

import (
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/database/migrations"
)

var UserAccessMigration = migrations.TableMigration{
	TableName: "user_access",
	Steps: []migrations.MigrationStep{
		{
			ID: "create-user-access-table",
			SQL: `
			CREATE TABLE IF NOT EXISTS user_access (
				user_id BINARY(16),
				client_id BINARY(16),
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				PRIMARY KEY (user_id, client_id),
				FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
				FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
				INDEX idx_user_lookup (user_id),
				INDEX idx_client_lookup (client_id)
			);`,
		},
	},
}
