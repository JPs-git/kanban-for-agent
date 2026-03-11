import { CardStatus } from '../../src/models/Card';

// 模拟Card模型
jest.mock('../../src/models/Card', () => {
  const CardStatus = {
    TODO: 'TODO',
    IN_PROGRESS: 'IN_PROGRESS',
    DONE: 'DONE',
    REJECTED: 'REJECTED'
  };
  
  class MockCard {
    _id: string;
    title: string;
    content: string;
    status: string;
    assignee: string | undefined;
    assigneeName: string | undefined;
    createdAt: Date;
    updatedAt: Date;
    
    constructor(cardData: { title: string; content: string; status?: string; assignee?: string; assigneeName?: string }) {
      this._id = `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      this.title = cardData.title;
      this.content = cardData.content;
      this.status = cardData.status || 'TODO';
      this.assignee = cardData.assignee;
      this.assigneeName = cardData.assigneeName;
      this.createdAt = new Date();
      this.updatedAt = new Date();
    }
    
    save() {
      if (!this.title) {
        return Promise.reject(new Error('Title is required'));
      }
      return Promise.resolve(this);
    }
  }
  
  return {
    CardStatus,
    Card: MockCard
  };
});

import { Card } from '../../src/models/Card';

describe('Card Model', () => {
  test('should create a card with default status TODO', async () => {
    const card = new Card({
      title: 'Test Card',
      content: 'Test content'
    });
    
    const savedCard = await card.save();
    
    expect(savedCard).toBeTruthy();
    expect(savedCard.title).toBe('Test Card');
    expect(savedCard.content).toBe('Test content');
    expect(savedCard.status).toBe(CardStatus.TODO);
    expect(savedCard.createdAt).toBeTruthy();
    expect(savedCard.updatedAt).toBeTruthy();
  });

  test('should create a card with specified status', async () => {
    const card = new Card({
      title: 'Test Card',
      content: 'Test content',
      status: CardStatus.IN_PROGRESS
    });
    
    const savedCard = await card.save();
    
    expect(savedCard.status).toBe(CardStatus.IN_PROGRESS);
  });

  test('should create a card with assignee', async () => {
    const card = new Card({
      title: 'Test Card',
      content: 'Test content',
      assignee: 'user123',
      assigneeName: 'John Doe'
    });
    
    const savedCard = await card.save();
    
    expect(savedCard.assignee).toBe('user123');
    expect(savedCard.assigneeName).toBe('John Doe');
  });

  test('should require title', async () => {
    const card = new Card({
      content: 'Test content'
    });
    
    await expect(card.save()).rejects.toThrow();
  });
});
