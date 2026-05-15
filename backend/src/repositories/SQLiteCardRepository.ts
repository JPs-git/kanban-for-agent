import crypto from 'crypto';
import { getDB } from '../config/sqlite';
import { Card, CardStatus } from '../models/Card';
import { CardRepository } from './CardRepository';

interface CardRow {
  id: number;
  uuid: string;
  title: string;
  content?: string;
  status: string;
  assignee?: string;
  assigneeName?: string;
  createdAt: string;
  updatedAt: string;
}

const rowToCard = (row: CardRow): Card => ({
  id: row.uuid,
  title: row.title,
  content: row.content,
  status: row.status as CardStatus,
  assignee: row.assignee,
  assigneeName: row.assigneeName,
  createdAt: new Date(row.createdAt),
  updatedAt: new Date(row.updatedAt),
});

export class SQLiteCardRepository extends CardRepository {
  find(): Card[] {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM cards WHERE uuid IS NOT NULL');
    const rows = stmt.all() as CardRow[];
    return rows.map(rowToCard);
  }

  findById(uuid: string): Card | undefined {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM cards WHERE uuid = ?');
    const row = stmt.get(uuid) as CardRow | undefined;
    if (!row) return undefined;
    return rowToCard(row);
  }

  create(cardData: {
    title: string;
    content?: string;
    status?: CardStatus;
    assignee?: string;
    assigneeName?: string;
  }): Card {
    const db = getDB();
    const uuid = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO cards (uuid, title, content, status, assignee, assigneeName)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      uuid,
      cardData.title,
      cardData.content || null,
      cardData.status || CardStatus.TODO,
      cardData.assignee || null,
      cardData.assigneeName || null,
    );
    return this.findById(uuid)!;
  }

  update(uuid: string, updateData: {
    title?: string;
    content?: string;
    status?: CardStatus;
    assignee?: string;
    assigneeName?: string;
  }): Card | undefined {
    const db = getDB();
    const setClauses: string[] = ['updatedAt = CURRENT_TIMESTAMP'];
    const params: (string | number | boolean | null)[] = [];
    if (updateData.title !== undefined) {
      setClauses.push('title = ?');
      params.push(updateData.title);
    }
    if (updateData.content !== undefined) {
      setClauses.push('content = ?');
      params.push(updateData.content);
    }
    if (updateData.status !== undefined) {
      setClauses.push('status = ?');
      params.push(updateData.status);
    }
    if (updateData.assignee !== undefined) {
      setClauses.push('assignee = ?');
      params.push(updateData.assignee);
    }
    if (updateData.assigneeName !== undefined) {
      setClauses.push('assigneeName = ?');
      params.push(updateData.assigneeName);
    }
    params.push(uuid);
    const stmt = db.prepare(
      `UPDATE cards SET ${setClauses.join(', ')} WHERE uuid = ?`,
    );
    const result = stmt.run(...params);
    if (result.changes === 0) return undefined;
    return this.findById(uuid);
  }

  delete(uuid: string): Card | undefined {
    const card = this.findById(uuid);
    if (!card) return undefined;
    const db = getDB();
    const stmt = db.prepare('DELETE FROM cards WHERE uuid = ?');
    stmt.run(uuid);
    return card;
  }
}