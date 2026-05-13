import { Card, CardStatus } from '../../src/models/Card';

describe('Card Model - UUID Features', () => {
  test('should generate UUID when creating a card', () => {
    const card = Card.create({
      title: 'UUID Test Card',
      content: 'Test content'
    });

    expect(card.id).toBeDefined();
    expect(typeof card.id).toBe('string');
    expect(card.id.length).toBe(36);
    expect(card.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  test('should create cards with unique UUIDs', () => {
    const cards = [];
    for (let i = 0; i < 10; i++) {
      cards.push(Card.create({ title: `Card ${i}` }));
    }

    const ids = cards.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(10);
  });

  test('should find card by UUID', () => {
    const card = Card.create({
      title: 'Find by UUID Test',
      content: 'Test content'
    });

    const foundCard = Card.findById(card.id);
    expect(foundCard).toBeDefined();
    expect(foundCard?.id).toBe(card.id);
    expect(foundCard?.title).toBe('Find by UUID Test');
  });

  test('should not find card by invalid UUID', () => {
    const foundCard = Card.findById('invalid-uuid');
    expect(foundCard).toBeUndefined();
  });

  test('should update card by UUID', () => {
    const card = Card.create({
      title: 'Update Test',
      status: CardStatus.TODO
    });

    const updatedCard = Card.findByIdAndUpdate(card.id, {
      title: 'Updated Title',
      status: CardStatus.DONE
    });

    expect(updatedCard).toBeDefined();
    expect(updatedCard?.id).toBe(card.id);
    expect(updatedCard?.title).toBe('Updated Title');
    expect(updatedCard?.status).toBe(CardStatus.DONE);
  });

  test('should delete card by UUID', () => {
    const card = Card.create({
      title: 'Delete Test'
    });
    const cardId = card.id;

    const deletedCard = Card.findByIdAndDelete(cardId);
    expect(deletedCard).toBeDefined();
    expect(deletedCard?.id).toBe(cardId);

    const foundCard = Card.findById(cardId);
    expect(foundCard).toBeUndefined();
  });

  test('should return only cards with UUID', () => {
    const cards = Card.find();
    cards.forEach(card => {
      expect(card.id).toBeDefined();
      expect(typeof card.id).toBe('string');
      expect(card.id.length).toBe(36);
    });
  });

  test('should have properly formatted UUID', () => {
    const card = Card.create({
      title: 'UUID Format Test'
    });

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(card.id).toMatch(uuidRegex);
  });

  test('should preserve UUID after update', () => {
    const card = Card.create({
      title: 'Preserve UUID Test'
    });
    const originalId = card.id;

    const updatedCard = Card.findByIdAndUpdate(originalId, {
      title: 'Updated'
    });

    expect(updatedCard?.id).toBe(originalId);
  });
});
