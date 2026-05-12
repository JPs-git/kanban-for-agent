import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const NODE_ENV = process.env.NODE_ENV || "development";

let dbPath: string;
const baseDir = path.join(__dirname, "../..");

if (process.env.SQLITE_PATH) {
  dbPath = path.join(baseDir, process.env.SQLITE_PATH);
} else {
  switch (NODE_ENV) {
    case "test":
      dbPath =
        process.env.SQLITE_TEST_PATH || path.join(baseDir, "data/test.db");
      break;
    case "production":
      dbPath =
        process.env.SQLITE_PROD_PATH || path.join(baseDir, "data/prod.db");
      break;
    default:
      dbPath = process.env.SQLITE_DEV_PATH || path.join(baseDir, "data/dev.db");
  }
}

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db: Database.Database;

const tableExists = (db: Database.Database, tableName: string): boolean => {
  const result = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(tableName);
  return !!result;
};

const columnExists = (
  db: Database.Database,
  tableName: string,
  columnName: string,
): boolean => {
  try {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    return columns.some((col: any) => col.name === columnName);
  } catch {
    return false;
  }
};

const addUUIDColumn = (db: Database.Database, tableName: string): void => {
  if (!columnExists(db, tableName, "uuid")) {
    try {
      db.exec(`ALTER TABLE ${tableName} ADD COLUMN uuid TEXT UNIQUE`);
      console.log(`Added uuid column to ${tableName} table`);
    } catch (error) {
      console.error(`Error adding uuid column to ${tableName}:`, error);
    }
  }
};

const recreateTableWithUUID = (
  db: Database.Database,
  tableName: string,
  createTableSQL: string,
): void => {
  try {
    db.exec(`ALTER TABLE ${tableName} RENAME TO ${tableName}_old`);
    db.exec(createTableSQL);
    db.exec(`INSERT INTO ${tableName} SELECT * FROM ${tableName}_old`);
    db.exec(`DROP TABLE ${tableName}_old`);
    console.log(`Recreated ${tableName} table with uuid column`);
  } catch (error) {
    console.error(`Error recreating ${tableName} table:`, error);
    try {
      db.exec(`DROP TABLE IF EXISTS ${tableName}`);
      db.exec(createTableSQL);
      console.log(`Created new ${tableName} table`);
    } catch (e) {
      console.error(`Failed to create ${tableName} table:`, e);
    }
  }
};

export const initDB = () => {
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE,
      name TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createCardsTable = `
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE,
      title TEXT NOT NULL,
      content TEXT,
      status TEXT NOT NULL DEFAULT 'TODO',
      assignee TEXT,
      assigneeName TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createMigrationsTable = `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.exec(createUsersTable);
  db.exec(createCardsTable);
  db.exec(createMigrationsTable);

  if (tableExists(db, "users") && !columnExists(db, "users", "uuid")) {
    recreateTableWithUUID(db, "users", createUsersTable);
  }

  if (tableExists(db, "cards") && !columnExists(db, "cards", "uuid")) {
    recreateTableWithUUID(db, "cards", createCardsTable);
  }

  console.log(`SQLite database initialized at: ${dbPath}`);
  return db;
};

export const getDB = () => {
  if (!db) {
    initDB();
  }
  return db;
};
