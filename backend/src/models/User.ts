import { getDB } from '../config/sqlite.js';

interface UserRow {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  id?: number;
  _id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const rowToUser = (row: UserRow): IUser => ({
  id: row.id,
  _id: String(row.id),
  name: row.name,
  createdAt: new Date(row.createdAt),
  updatedAt: new Date(row.updatedAt)
});

export const User = {
  find: (): IUser[] => {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM users ORDER BY createdAt DESC');
    const rows = stmt.all() as UserRow[];
    return rows.map(rowToUser);
  },

  findById: (id: number): IUser | undefined => {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id) as UserRow | undefined;
    if (!row) return undefined;
    return rowToUser(row);
  },

  create: (userData: { name: string }): IUser => {
    const db = getDB();
    const stmt = db.prepare('INSERT INTO users (name) VALUES (?)');
    const result = stmt.run(userData.name);
    return User.findById(result.lastInsertRowid as number)!;
  },

  findByIdAndUpdate: (id: number, updateData: { name: string }): IUser | undefined => {
    const db = getDB();
    const stmt = db.prepare('UPDATE users SET name = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run(updateData.name, id);
    if (result.changes === 0) return undefined;
    return User.findById(id);
  },

  findByIdAndDelete: (id: number): IUser | undefined => {
    const user = User.findById(id);
    if (!user) return undefined;
    const db = getDB();
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(id);
    return user;
  }
};
