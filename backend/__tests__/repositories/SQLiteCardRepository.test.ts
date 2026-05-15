import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { SQLiteCardRepository } from '../../src/repositories/SQLiteCardRepository';
import { CardStatus } from '../../src/models/Card';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resetDB } from '../../src/config/sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('SQLiteCardRepository', () => {
  let repository: SQLiteCardRepository;
  let testDbPath: string;

  beforeEach(() => {
    testDbPath = path.join(__dirname, `../../data/test_card_repo_${Date.now()}.db`);
    process.env.SQLITE_PATH = testDbPath;
    resetDB();
    repository = new SQLiteCardRepository();
  });

  afterEach(() => {
    try {
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
      }
    } catch {
    }
  });

  test('should create a card', () => {
    const card = repository.create({ title: 'Test Card' });
    
    expect(card.id).toBeDefined();
    expect(card.title).toBe('Test Card');
    expect(card.status).toBe(CardStatus.TODO);
    expect(card.createdAt).toBeDefined();
  });

  test('should find all cards', () => {
    repository.create({ title: 'Card 1' });
    repository.create({ title: 'Card 2' });
    
    const cards = repository.find();
    
    expect(cards.length).toBe(2);
    expect(cards[0].title).toBe('Card 1');
    expect(cards[1].title).toBe('Card 2');
  });

  test('should find card by id', () => {
    const createdCard = repository.create({ title: 'Find Me' });
    
    const foundCard = repository.findById(createdCard.id);
    
    expect(foundCard).toBeDefined();
    expect(foundCard?.id).toBe(createdCard.id);
    expect(foundCard?.title).toBe('Find Me');
  });

  test('should return undefined when finding non-existent card', () => {
    const found = repository.findById('non-existent-uuid');
    
    expect(found).toBeUndefined();
  });

  test('should update card', () => {
    const createdCard = repository.create({ title: 'Original' });
    
    const updatedCard = repository.update(createdCard.id, { 
      title: 'Updated',
      status: CardStatus.IN_PROGRESS 
    });
    
    expect(updatedCard).toBeDefined();
    expect(updatedCard?.title).toBe('Updated');
    expect(updatedCard?.status).toBe(CardStatus.IN_PROGRESS);
    expect(updatedCard?.updatedAt).toBeDefined();
  });

  test('should return undefined when updating non-existent card', () => {
    const result = repository.update('non-existent-uuid', { title: 'Updated' });
    
    expect(result).toBeUndefined();
  });

  test('should update partial fields', () => {
    const createdCard = repository.create({ title: 'Full', content: 'Original content' });
    
    const updatedCard = repository.update(createdCard.id, { title: 'Partial Update' });
    
    expect(updatedCard).toBeDefined();
    expect(updatedCard?.title).toBe('Partial Update');
    expect(updatedCard?.content).toBe('Original content');
  });

  test('should delete card', () => {
    const createdCard = repository.create({ title: 'To Delete' });
    
    const deletedCard = repository.delete(createdCard.id);
    
    expect(deletedCard).toBeDefined();
    expect(deletedCard?.title).toBe('To Delete');
    
    const found = repository.findById(createdCard.id);
    expect(found).toBeUndefined();
  });

  test('should return undefined when deleting non-existent card', () => {
    const result = repository.delete('non-existent-uuid');
    
    expect(result).toBeUndefined();
  });

  test('should create card with assignee', () => {
    const card = repository.create({ 
      title: 'Assigned Card',
      assignee: 'user-uuid',
      assigneeName: 'Test User'
    });
    
    expect(card.assignee).toBe('user-uuid');
    expect(card.assigneeName).toBe('Test User');
  });

  test('should update card assignee', () => {
    const card = repository.create({ title: 'Card' });
    
    const updated = repository.update(card.id, { 
      assignee: 'new-user',
      assigneeName: 'New User'
    });
    
    expect(updated?.assignee).toBe('new-user');
    expect(updated?.assigneeName).toBe('New User');
  });

  test('should unassign card', () => {
    const card = repository.create({ 
      title: 'Assigned',
      assignee: 'user',
      assigneeName: 'User'
    });
    
    const updated = repository.update(card.id, { 
      assignee: null,
      assigneeName: '未分配'
    });
    
    expect(updated?.assignee).toBeNull();
    expect(updated?.assigneeName).toBe('未分配');
  });
});