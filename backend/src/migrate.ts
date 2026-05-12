import { initDB } from './config/sqlite.js';
import { runMigrations } from './migrations/index.js';
import dotenv from 'dotenv';
import path from 'path';

const currentDir = process.cwd();

const envFromArgv = process.argv.find(arg => arg.startsWith('NODE_ENV='));
const envFromEnv = process.env.NODE_ENV;
const env = envFromArgv ? envFromArgv.split('=')[1] : envFromEnv || 'development';

const envPath = path.join(
  currentDir,
  `.env${env === 'production' ? '' : `.${env}`}`,
);

dotenv.config({ path: envPath });
process.env.NODE_ENV = env;

async function main() {
  console.log(`🔄 Running database migrations for ${env} environment...\n`);

  try {
    initDB();
    await runMigrations();
    console.log('\n✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

if (process.argv[1]?.endsWith('migrate.ts')) {
  main();
}
