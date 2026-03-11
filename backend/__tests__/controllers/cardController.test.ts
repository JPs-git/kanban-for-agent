import request from 'supertest';
import mongoose from 'mongoose';
import { Card, CardStatus } from '../../src/models/Card';
import { app } from '../../src/server';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 测试前连接数据库
beforeAll(async () => {
  // 使用环境变量或默认值构建测试数据库连接字符串
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kanban';
  // 替换数据库名称为test
  const testMongoUri = mongoUri.replace(/\/([^\/]+)$/, '/test');
  await mongoose.connect(testMongoUri);
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

describe('Card Controller', () => {
  test('GET /api/cards should return all cards', async () => {
    // 创建测试数据
    const card1 = new Card({ title: 'Card 1', content: 'Content 1' });
    const card2 = new Card({ title: 'Card 2', content: 'Content 2' });
    await card1.save();
    await card2.save();

    const response = await request(app).get('/api/cards');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].title).toBe('Card 1');
    expect(response.body[1].title).toBe('Card 2');
  });

  test('POST /api/cards should create a new card', async () => {
    const cardData = {
      title: 'New Card',
      content: 'New content',
      status: CardStatus.IN_PROGRESS
    };

    const response = await request(app).post('/api/cards').send(cardData);
    
    expect(response.status).toBe(201);
    expect(response.body.title).toBe('New Card');
    expect(response.body.content).toBe('New content');
    expect(response.body.status).toBe(CardStatus.IN_PROGRESS);
  });

  test('POST /api/cards should return 400 if title is missing', async () => {
    const cardData = {
      content: 'Content without title'
    };

    const response = await request(app).post('/api/cards').send(cardData);
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Title is required');
  });

  test('PUT /api/cards/:id should update a card', async () => {
    // 创建测试数据
    const card = new Card({ title: 'Old Title', content: 'Old content' });
    await card.save();

    const updateData = {
      title: 'Updated Title',
      content: 'Updated content',
      status: CardStatus.DONE
    };

    const response = await request(app).put(`/api/cards/${card._id}`).send(updateData);
    
    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated Title');
    expect(response.body.content).toBe('Updated content');
    expect(response.body.status).toBe(CardStatus.DONE);
  });

  test('PUT /api/cards/:id should return 404 if card not found', async () => {
    const updateData = {
      title: 'Updated Title'
    };

    // 使用一个不存在的ID
    const response = await request(app).put('/api/cards/600000000000000000000000').send(updateData);
    
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Card not found');
  });

  test('DELETE /api/cards/:id should delete a card', async () => {
    // 创建测试数据
    const card = new Card({ title: 'Card to delete', content: 'Content' });
    await card.save();

    const response = await request(app).delete(`/api/cards/${card._id}`);
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Card deleted successfully');

    // 验证卡片已被删除
    const deletedCard = await Card.findById(card._id);
    expect(deletedCard).toBeNull();
  });

  test('DELETE /api/cards/:id should return 404 if card not found', async () => {
    // 使用一个不存在的ID
    const response = await request(app).delete('/api/cards/600000000000000000000000');
    
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Card not found');
  });
});
