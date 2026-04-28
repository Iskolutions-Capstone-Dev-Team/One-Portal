package migrations

type MigrationPart struct {
	Name string
	SQL  string
}

type MigrationStep struct {
	ID  string
	SQL string
}

type TableMigration struct {
	TableName string
	Steps     []MigrationStep
}
