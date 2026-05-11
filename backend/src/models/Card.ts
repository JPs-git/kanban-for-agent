import { getDB } from "../config/sqlite.js";

export enum CardStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
  REJECTED = "REJECTED",
}

interface CardRow {
  id: number;
  title: string;
  content?: string;
  status: string;
  assignee?: string;
  assigneeName?: string;
  createdAt: string;
  updatedAt: string;
}

interface Card {
  id?: number;
  _id: string;
  title: string;
  content?: string;
  status: CardStatus;
  assignee?: string;
  assigneeName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const rowToCard = (row: CardRow): Card => ({
  id: row.id,
  _id: String(row.id),
  title: row.title,
  content: row.content,
  status: row.status as CardStatus,
  assignee: row.assignee,
  assigneeName: row.assigneeName,
  createdAt: new Date(row.createdAt),
  updatedAt: new Date(row.updatedAt),
});

export const Card = {
  find: (): Card[] => {
    const db = getDB();
    const stmt = db.prepare("SELECT * FROM cards");
    const rows = stmt.all() as CardRow[];
    return rows.map(rowToCard);
  },

  findById: (id: number): Card | undefined => {
    const db = getDB();
    const stmt = db.prepare("SELECT * FROM cards WHERE id = ?");
    const row = stmt.get(id) as CardRow | undefined;
    if (!row) return undefined;
    return rowToCard(row);
  },

  create: (cardData: {
    title: string;
    content?: string;
    status?: CardStatus;
    assignee?: string;
    assigneeName?: string;
  }): Card => {
    const db = getDB();
    const stmt = db.prepare(`
      INSERT INTO cards (title, content, status, assignee, assigneeName)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      cardData.title,
      cardData.content || null,
      cardData.status || CardStatus.TODO,
      cardData.assignee || null,
      cardData.assigneeName || null,
    );
    return Card.findById(result.lastInsertRowid as number)!;
  },

  findByIdAndUpdate: (
    id: number,
    updateData: {
      title?: string;
      content?: string;
      status?: CardStatus;
      assignee?: string;
      assigneeName?: string;
    },
  ): Card | undefined => {
    const db = getDB();
    const setClauses: string[] = ["updatedAt = CURRENT_TIMESTAMP"];
    const params: (string | number | boolean | null)[] = [];
    if (updateData.title !== undefined) {
      setClauses.push("title = ?");
      params.push(updateData.title);
    }
    if (updateData.content !== undefined) {
      setClauses.push("content = ?");
      params.push(updateData.content);
    }
    if (updateData.status !== undefined) {
      setClauses.push("status = ?");
      params.push(updateData.status);
    }
    if (updateData.assignee !== undefined) {
      setClauses.push("assignee = ?");
      params.push(updateData.assignee);
    }
    if (updateData.assigneeName !== undefined) {
      setClauses.push("assigneeName = ?");
      params.push(updateData.assigneeName);
    }
    params.push(id);
    const stmt = db.prepare(
      `UPDATE cards SET ${setClauses.join(", ")} WHERE id = ?`,
    );
    const result = stmt.run(...params);
    if (result.changes === 0) return undefined;
    return Card.findById(id);
  },

  findByIdAndDelete: (id: number): Card | undefined => {
    const card = Card.findById(id);
    if (!card) return undefined;
    const db = getDB();
    const stmt = db.prepare("DELETE FROM cards WHERE id = ?");
    stmt.run(id);
    return card;
  },
};
