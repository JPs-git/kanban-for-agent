import { describe, test, expect, jest } from "@jest/globals";

interface MockCard {
  id: number;
  title: string;
  content: string;
  status: string;
  assignee?: string;
  assigneeName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CardStatus = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
  REJECTED: "REJECTED",
};

function createMockCardModule() {
  const mockCards: MockCard[] = [];
  let nextId = 1;

  return {
    CardStatus,
    Card: {
      find: jest.fn().mockImplementation(() => mockCards),
      findById: jest.fn().mockImplementation((id: number) => {
        const card = mockCards.find((c) => c.id === id);
        return card || undefined;
      }),
      create: jest.fn().mockImplementation((cardData: {
        title: string;
        content?: string;
        status?: string;
        assignee?: string;
        assigneeName?: string;
      }) => {
        const newCard: MockCard = {
          id: nextId++,
          title: cardData.title,
          content: cardData.content || "",
          status: cardData.status || "TODO",
          assignee: cardData.assignee,
          assigneeName: cardData.assigneeName,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockCards.push(newCard);
        return newCard;
      }),
      findByIdAndUpdate: jest.fn().mockImplementation(
        (
          id: number,
          update: {
            title?: string;
            content?: string;
            status?: string;
            assignee?: string;
            assigneeName?: string;
          }
        ) => {
          const index = mockCards.findIndex((c) => c.id === id);
          if (index === -1) {
            return undefined;
          }
          const updatedCard = { ...mockCards[index], ...update, updatedAt: new Date() };
          mockCards[index] = updatedCard;
          return updatedCard;
        }
      ),
      findByIdAndDelete: jest.fn().mockImplementation((id: number) => {
        const index = mockCards.findIndex((c) => c.id === id);
        if (index === -1) {
          return undefined;
        }
        const deletedCard = mockCards[index];
        mockCards.splice(index, 1);
        return deletedCard;
      }),
    },
  };
}

describe('Card model', () => {
  let mockModule: ReturnType<typeof createMockCardModule>;

  beforeEach(() => {
    mockModule = createMockCardModule();
  });

  test('should create a card with default status TODO', () => {
    const card = mockModule.Card.create({ title: 'Test Card' });
    expect(card.title).toBe('Test Card');
    expect(card.status).toBe(CardStatus.TODO);
    expect(card.id).toBeDefined();
  });

  test('should create a card with custom status', () => {
    const card = mockModule.Card.create({ 
      title: 'In Progress Card', 
      status: CardStatus.IN_PROGRESS 
    });
    expect(card.title).toBe('In Progress Card');
    expect(card.status).toBe(CardStatus.IN_PROGRESS);
  });

  test('should find all cards', () => {
    const cards = mockModule.Card.find();
    expect(Array.isArray(cards)).toBe(true);
  });

  test('should find card by id', () => {
    const card = mockModule.Card.create({ title: 'Findable Card' });
    const found = mockModule.Card.findById(card.id);
    expect(found).toBeDefined();
    expect(found?.title).toBe('Findable Card');
  });

  test('should return undefined when card not found', () => {
    const found = mockModule.Card.findById(99999);
    expect(found).toBeUndefined();
  });

  test('should update a card', () => {
    const card = mockModule.Card.create({ title: 'Original Title' });
    const updated = mockModule.Card.findByIdAndUpdate(card.id, { 
      title: 'Updated Title',
      status: CardStatus.DONE 
    });
    expect(updated?.title).toBe('Updated Title');
    expect(updated?.status).toBe(CardStatus.DONE);
  });

  test('should delete a card', () => {
    const card = mockModule.Card.create({ title: 'To be deleted' });
    const deleted = mockModule.Card.findByIdAndDelete(card.id);
    expect(deleted?.title).toBe('To be deleted');
    const found = mockModule.Card.findById(card.id);
    expect(found).toBeUndefined();
  });
});
