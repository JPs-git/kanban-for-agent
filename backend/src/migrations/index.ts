import { MigrationManager } from '../config/migration.js';
import { getDB } from '../config/sqlite.js';
import { up as cardsMigration } from './001_add_uuid_to_cards.js';
import { up as usersMigration } from './002_add_uuid_to_users.js';

export async function runMigrations(): Promise<void> {
  const db = getDB();
  const manager = new MigrationManager(db);

  manager.registerMigration({
    version: '001',
    name: 'add_uuid_to_cards',
    up: cardsMigration
  });

  manager.registerMigration({
    version: '002',
    name: 'add_uuid_to_users',
    up: usersMigration
  });

  await manager.runPendingMigrations();
}

if (process.argv[1] && process.argv[1].endsWith('migrate.ts')) {
  console.log('🔄 Running database migrations...\n');

  runMigrations()
    .then(() => {
      console.log('\n✅ All migrations completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}
