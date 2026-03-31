package tables

import "github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/database/migrations"

var LogsMigration = migrations.TableMigration{
	TableName: "logs",
	Steps: []migrations.MigrationStep{
		{
			ID: "create-logs-table",
			SQL: `
			 CREATE TABLE IF NOT EXISTS logs (
				id BIGINT AUTO_INCREMENT PRIMARY KEY,
				actor VARCHAR(100),
				action VARCHAR(100) NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			);`,
		},
	},
}
