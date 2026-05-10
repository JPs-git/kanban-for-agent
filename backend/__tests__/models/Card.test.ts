import { Card, CardStatus } from '../../src/models/Card';

describe('Card Model', () => {
  test('should create a card with default status TODO', () => {
    const card = Card.create({
      title: 'Test Card',
      content: 'Test content'
    });
    
    expect(card).toBeTruthy();
    expect(card.title).toBe('Test Card');
    expect(card.content).toBe('Test content');
    expect(card.status).toBe(CardStatus.TODO);
    expect(card.createdAt).toBeTruthy();
    expect(card.updatedAt).toBeTruthy();
  });

  test('should create a card with specified status', () => {
    const card = Card.create({
      title: 'Test Card',
      content: 'Test content',
      status: CardStatus.IN_PROGRESS
    });
    
    expect(card.status).toBe(CardStatus.IN_PROGRESS);
  });

  test('should create a card with assignee', () => {
    const card = Card.create({
      title: 'Test Card',
      content: 'Test content',
      assignee: 'user123',
      assigneeName: 'John Doe'
    });
    
    expect(card.assignee).toBe('user123');
    expect(card.assigneeName).toBe('John Doe');
  });

  test('should find all cards', () => {
    const cards = Card.find();
    expect(Array.isArray(cards)).toBe(true);
  });

  test('should find card by id', () => {
    const card = Card.create({
      title: 'Test Card'
    });
    
    const foundCard = Card.findById(card.id!);
    expect(foundCard).toBeTruthy();
    expect(foundCard?.title).toBe('Test Card');
  });

  test('should update a card', () => {
    const card = Card.create({
      title: 'Test Card'
    });
    
    const updatedCard = Card.findByIdAndUpdate(card.id!, {
      title: 'Updated Card',
      status: CardStatus.DONE
    });
    
    expect(updatedCard).toBeTruthy();
    expect(updatedCard?.title).toBe('Updated Card');
    expect(updatedCard?.status).toBe(CardStatus.DONE);
  });

  test('should delete a card', () => {
    const card = Card.create({
      title: 'Test Card'
    });
    
    const deletedCard = Card.findByIdAndDelete(card.id!);
    expect(deletedCard).toBeTruthy();
    
    const foundCard = Card.findById(card.id!);
    expect(foundCard).toBeUndefined();
  });
});