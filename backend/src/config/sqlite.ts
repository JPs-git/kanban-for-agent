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

export const initDB = () => {
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      status TEXT NOT NULL DEFAULT 'TODO',
      assignee TEXT,
      assigneeName TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log(`SQLite database initialized at: ${dbPath}`);
  return db;
};

export const getDB = () => {
  if (!db) {
    initDB();
  }
  return db;
};
