import mongoose from 'mongoose';
import { Card, CardStatus } from '../../src/models/Card';

// 测试前连接数据库
beforeAll(async () => {
  // 使用内存数据库进行测试
  await mongoose.connect('mongodb://localhost:27017/test');
});

// 测试后清理
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// 测试中清理
afterEach(async () => {
  await Card.deleteMany({});
});

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
