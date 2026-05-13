import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import Database from 'better-sqlite3';
import { up as addUuidToCards } from '../../src/migrations/001_add_uuid_to_cards';
import { up as addUuidToUsers } from '../../src/migrations/002_add_uuid_to_users';

describe('UUID Migrations', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  describe('001_add_uuid_to_cards', () => {
    test('should generate UUIDs for existing cards without UUID', () => {
      db.exec(`
        CREATE TABLE cards (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content TEXT,
          status TEXT DEFAULT 'TODO',
          assignee TEXT,
          assigneeName TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
          uuid TEXT
        );
      `);

      db.prepare('INSERT INTO cards (title) VALUES (?), (?), (?)').run('Card 1', 'Card 2', 'Card 3');

      addUuidToCards(db);

      const cards = db.prepare('SELECT * FROM cards WHERE uuid IS NOT NULL').all() as { uuid: string }[];
      expect(cards).toHaveLength(3);

      cards.forEach(card => {
        expect(card.uuid).toBeDefined();
        expect(card.uuid).toContain('-');
      });
    });

    test('should not overwrite existing UUIDs', () => {
      db.exec(`
        CREATE TABLE cards (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content TEXT,
          status TEXT DEFAULT 'TODO',
          assignee TEXT,
          assigneeName TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
          uuid TEXT
        );
      `);
      db.prepare('INSERT INTO cards (title, uuid) VALUES (?, ?)').run('Card 1', 'existing-uuid-123');

      addUuidToCards(db);

      const card = db.prepare('SELECT uuid FROM cards WHERE title = ?').get('Card 1') as { uuid: string };
      expect(card.uuid).toBe('existing-uuid-123');
    });

    test('should handle cards table with uuid column already present', () => {
      db.exec(`
        CREATE TABLE cards (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content TEXT,
          status TEXT DEFAULT 'TODO',
          assignee TEXT,
          assigneeName TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
          uuid TEXT
        );
      `);

      addUuidToCards(db);

      const columns = db.prepare("PRAGMA table_info(cards)").all() as { name: string }[];
      const uuidColumn = columns.find(col => col.name === 'uuid');
      
      expect(uuidColumn).toBeDefined();
    });

    test('should handle mixed cards with and without UUIDs', () => {
      db.exec(`
        CREATE TABLE cards (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content TEXT,
          status TEXT DEFAULT 'TODO',
          assignee TEXT,
          assigneeName TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
          uuid TEXT
        );
      `);
      db.prepare('INSERT INTO cards (title, uuid) VALUES (?, ?)').run('Card 1', 'existing-uuid-123');
      db.prepare('INSERT INTO cards (title) VALUES (?), (?)').run('Card 2', 'Card 3');

      addUuidToCards(db);

      const cards = db.prepare('SELECT * FROM cards').all() as { uuid: string; title: string }[];
      expect(cards).toHaveLength(3);

      const card1 = cards.find(c => c.title === 'Card 1');
      expect(card1?.uuid).toBe('existing-uuid-123');

      const card2 = cards.find(c => c.title === 'Card 2');
      expect(card2?.uuid).toBeDefined();
      expect(card2?.uuid).toContain('-');

      const card3 = cards.find(c => c.title === 'Card 3');
      expect(card3?.uuid).toBeDefined();
      expect(card3?.uuid).toContain('-');
    });
  });

  describe('002_add_uuid_to_users', () => {
    test('should generate UUIDs for existing users without UUID', () => {
      db.exec(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
          uuid TEXT
        );
      `);

      db.prepare('INSERT INTO users (name) VALUES (?), (?), (?)').run('User 1', 'User 2', 'User 3');

      addUuidToUsers(db);

      const users = db.prepare('SELECT * FROM users WHERE uuid IS NOT NULL').all() as { uuid: string }[];
      expect(users).toHaveLength(3);

      users.forEach(user => {
        expect(user.uuid).toBeDefined();
        expect(user.uuid).toContain('-');
      });
    });

    test('should not overwrite existing UUIDs', () => {
      db.exec(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
          uuid TEXT
        );
      `);
      db.prepare('INSERT INTO users (name, uuid) VALUES (?, ?)').run('User 1', 'existing-user-uuid');

      addUuidToUsers(db);

      const user = db.prepare('SELECT uuid FROM users WHERE name = ?').get('User 1') as { uuid: string };
      expect(user.uuid).toBe('existing-user-uuid');
    });

    test('should handle users table with uuid column already present', () => {
      db.exec(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
          uuid TEXT
        );
      `);

      addUuidToUsers(db);

      const columns = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
      const uuidColumn = columns.find(col => col.name === 'uuid');
      
      expect(uuidColumn).toBeDefined();
    });

    test('should handle mixed users with and without UUIDs', () => {
      db.exec(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
          uuid TEXT
        );
      `);
      db.prepare('INSERT INTO users (name, uuid) VALUES (?, ?)').run('User 1', 'existing-uuid-123');
      db.prepare('INSERT INTO users (name) VALUES (?), (?)').run('User 2', 'User 3');

      addUuidToUsers(db);

      const users = db.prepare('SELECT * FROM users').all() as { uuid: string; name: string }[];
      expect(users).toHaveLength(3);

      const user1 = users.find(u => u.name === 'User 1');
      expect(user1?.uuid).toBe('existing-uuid-123');

      const user2 = users.find(u => u.name === 'User 2');
      expect(user2?.uuid).toBeDefined();
      expect(user2?.uuid).toContain('-');

      const user3 = users.find(u => u.name === 'User 3');
      expect(user3?.uuid).toBeDefined();
      expect(user3?.uuid).toContain('-');
    });
  });
});