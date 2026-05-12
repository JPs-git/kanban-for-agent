import { getDB } from "../config/sqlite.js";

interface UserRow {
  id: number;
  uuid: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const rowToUser = (row: UserRow): IUser => ({
  id: row.uuid,
  name: row.name,
  createdAt: new Date(row.createdAt),
  updatedAt: new Date(row.updatedAt),
});

export const User = {
  find: (): IUser[] => {
    const db = getDB();
    const stmt = db.prepare(
      "SELECT * FROM users WHERE uuid IS NOT NULL ORDER BY createdAt DESC",
    );
    const rows = stmt.all() as UserRow[];
    return rows.map(rowToUser);
  },

  findById: (uuid: string): IUser | undefined => {
    const db = getDB();
    const stmt = db.prepare("SELECT * FROM users WHERE uuid = ?");
    const row = stmt.get(uuid) as UserRow | undefined;
    if (!row) return undefined;
    return rowToUser(row);
  },

  create: (userData: { name: string }): IUser => {
    const db = getDB();

    const uuid = crypto.randomUUID();

    const stmt = db.prepare("INSERT INTO users (uuid, name) VALUES (?, ?)");
    stmt.run(uuid, userData.name);

    return User.findById(uuid)!;
  },

  findByIdAndUpdate: (
    uuid: string,
    updateData: { name: string },
  ): IUser | undefined => {
    const db = getDB();
    const stmt = db.prepare(
      "UPDATE users SET name = ?, updatedAt = CURRENT_TIMESTAMP WHERE uuid = ?",
    );
    const result = stmt.run(updateData.name, uuid);
    if (result.changes === 0) return undefined;
    return User.findById(uuid);
  },

  findByIdAndDelete: (uuid: string): IUser | undefined => {
    const user = User.findById(uuid);
    if (!user) return undefined;
    const db = getDB();
    const stmt = db.prepare("DELETE FROM users WHERE uuid = ?");
    stmt.run(uuid);
    return user;
  },
};
