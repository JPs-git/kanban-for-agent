import Database from 'better-sqlite3';

interface Migration {
  version: string;
  name: string;
  up: (db: Database.Database) => void;
  down?: (db: Database.Database) => void;
}

interface AppliedMigration {
  version: string;
  applied_at: string;
}

export class MigrationManager {
  private db: Database.Database;
  private migrations: Migration[] = [];
  private migrationsPath: string;

  constructor(db: Database.Database) {
    this.db = db;
    this.migrationsPath = '';
    this.initialize();
  }

  private initialize(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  registerMigration(migration: Migration): void {
    this.migrations.push(migration);
    this.migrations.sort((a, b) => a.version.localeCompare(b.version));
  }

  getAppliedMigrations(): AppliedMigration[] {
    const stmt = this.db.prepare(
      'SELECT version, applied_at FROM schema_migrations ORDER BY version'
    );
    return stmt.all() as AppliedMigration[];
  }

  getPendingMigrations(): Migration[] {
    const applied = this.getAppliedMigrations();
    const appliedVersions = new Set(applied.map(m => m.version));

    return this.migrations.filter(
      migration => !appliedVersions.has(migration.version)
    );
  }

  async runPendingMigrations(): Promise<void> {
    const pending = this.getPendingMigrations();

    if (pending.length === 0) {
      console.log('✅ No pending migrations');
      return;
    }

    console.log(`🔄 Running ${pending.length} pending migration(s)...\n`);

    for (const migration of pending) {
      console.log(`📦 Running migration: ${migration.version} - ${migration.name}`);

      try {
        const transaction = this.db.transaction(() => {
          migration.up(this.db);

          const stmt = this.db.prepare(
            'INSERT INTO schema_migrations (version, name) VALUES (?, ?)'
          );
          stmt.run(migration.version, migration.name);
        });

        transaction();
        console.log(`✅ Migration ${migration.version} applied successfully\n`);
      } catch (error) {
        console.error(`❌ Migration ${migration.version} failed:`, error);
        throw error;
      }
    }

    console.log('✅ All migrations completed successfully!');
  }

  async rollbackMigration(version: string): Promise<void> {
    const migration = this.migrations.find(m => m.version === version);

    if (!migration) {
      throw new Error(`Migration ${version} not found`);
    }

    if (!migration.down) {
      throw new Error(`Migration ${version} does not support rollback`);
    }

    console.log(`🔄 Rolling back migration: ${version} - ${migration.name}`);

    try {
      const transaction = this.db.transaction(() => {
        migration.down!(this.db);

        const stmt = this.db.prepare(
          'DELETE FROM schema_migrations WHERE version = ?'
        );
        stmt.run(version);
      });

      transaction();
      console.log(`✅ Migration ${version} rolled back successfully`);
    } catch (error) {
      console.error(`❌ Rollback of migration ${version} failed:`, error);
      throw error;
    }
  }

  getMigrationStatus(): { applied: AppliedMigration[]; pending: Migration[] } {
    return {
      applied: this.getAppliedMigrations(),
      pending: this.getPendingMigrations()
    };
  }
}
