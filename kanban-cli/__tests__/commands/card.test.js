import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  cards,
  cardGet,
  cardCreate,
  cardUpdate,
  cardDelete,
  __setApiClient,
  __setLogger,
} from '../../src/commands/card.js';

describe('Card Commands', () => {
  let mockApiClient;
  let mockLogger;

  beforeEach(() => {
    mockApiClient = {
      getCards: jest.fn(),
      getCard: jest.fn(),
      createCard: jest.fn(),
      updateCard: jest.fn(),
      deleteCard: jest.fn(),
    };

    mockLogger = {
      success: jest.fn(),
      failure: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
    };

    __setApiClient(jest.fn(() => mockApiClient));
    __setLogger(mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('cards', () => {
    test('lists all cards', async () => {
      const mockCards = [
        { id: '1', title: 'Card 1', status: 'TODO' },
        { id: '2', title: 'Card 2', status: 'IN_PROGRESS' },
      ];
      mockApiClient.getCards.mockResolvedValue(mockCards);

      const originalLog = console.log;
      const mockLog = jest.fn();
      console.log = mockLog;

      await cards();

      expect(mockApiClient.getCards).toHaveBeenCalled();
      expect(mockLog).toHaveBeenCalledWith(JSON.stringify(mockCards, null, 2));
      console.log = originalLog;
    });

    test('handles error when listing cards', async () => {
      mockApiClient.getCards.mockRejectedValue(new Error('API error'));
      const originalExit = process.exit;
      const mockExit = jest.fn();
      process.exit = mockExit;

      await cards();

      expect(mockLogger.failure).toHaveBeenCalledWith('Failed to list cards: API error');
      expect(mockExit).toHaveBeenCalledWith(1);
      process.exit = originalExit;
    });
  });

  describe('cardGet', () => {
    test('gets a card by id', async () => {
      const mockCard = { id: '1', title: 'Test Card', status: 'TODO' };
      mockApiClient.getCard.mockResolvedValue(mockCard);

      const originalLog = console.log;
      const mockLog = jest.fn();
      console.log = mockLog;

      await cardGet({ id: '1' });

      expect(mockApiClient.getCard).toHaveBeenCalledWith('1');
      expect(mockLog).toHaveBeenCalledWith(JSON.stringify(mockCard, null, 2));
      console.log = originalLog;
    });

    test('handles missing id', async () => {
      const originalExit = process.exit;
      const mockExit = jest.fn();
      process.exit = mockExit;

      await cardGet({});

      expect(mockLogger.error).toHaveBeenCalledWith('Card ID is required');
      expect(mockExit).toHaveBeenCalledWith(1);
      process.exit = originalExit;
    });

    test('handles error when getting card', async () => {
      mockApiClient.getCard.mockRejectedValue(new Error('Card not found'));
      const originalExit = process.exit;
      const mockExit = jest.fn();
      process.exit = mockExit;

      await cardGet({ id: '1' });

      expect(mockLogger.failure).toHaveBeenCalledWith('Failed to get card: Card not found');
      expect(mockExit).toHaveBeenCalledWith(1);
      process.exit = originalExit;
    });
  });

  describe('cardCreate', () => {
    test('creates a card with minimum fields', async () => {
      const mockCard = { id: '1', title: 'New Card', status: 'TODO' };
      mockApiClient.createCard.mockResolvedValue(mockCard);

      const originalLog = console.log;
      const mockLog = jest.fn();
      console.log = mockLog;

      await cardCreate({ title: 'New Card' });

      expect(mockApiClient.createCard).toHaveBeenCalledWith({
        title: 'New Card',
        content: undefined,
        status: 'TODO',
        assignee: undefined,
        assigneeName: undefined,
      });
      expect(mockLog).toHaveBeenCalledWith(JSON.stringify(mockCard, null, 2));
      expect(mockLogger.success).toHaveBeenCalledWith('Card created successfully');
      console.log = originalLog;
    });

    test('creates a card with all fields', async () => {
      const mockCard = { id: '1', title: 'New Card', status: 'IN_PROGRESS', content: 'Content', assignee: 'user1', assigneeName: 'John' };
      mockApiClient.createCard.mockResolvedValue(mockCard);

      const originalLog = console.log;
      const mockLog = jest.fn();
      console.log = mockLog;

      await cardCreate({
        title: 'New Card',
        content: 'Content',
        status: 'IN_PROGRESS',
        assignee: 'user1',
        assigneeName: 'John',
      });

      expect(mockApiClient.createCard).toHaveBeenCalledWith({
        title: 'New Card',
        content: 'Content',
        status: 'IN_PROGRESS',
        assignee: 'user1',
        assigneeName: 'John',
      });
      console.log = originalLog;
    });

    test('handles missing title', async () => {
      const originalExit = process.exit;
      const mockExit = jest.fn();
      process.exit = mockExit;

      await cardCreate({});

      expect(mockLogger.error).toHaveBeenCalledWith('Title is required');
      expect(mockExit).toHaveBeenCalledWith(1);
      process.exit = originalExit;
    });

    test('handles empty title', async () => {
      const originalExit = process.exit;
      const mockExit = jest.fn();
      process.exit = mockExit;

      await cardCreate({ title: '' });

      expect(mockLogger.error).toHaveBeenCalledWith('Title is required');
      expect(mockExit).toHaveBeenCalledWith(1);
      process.exit = originalExit;
    });

    test('handles whitespace-only title', async () => {
      const originalExit = process.exit;
      const mockExit = jest.fn();
      process.exit = mockExit;

      await cardCreate({ title: '   ' });

      expect(mockLogger.error).toHaveBeenCalledWith('Title is required');
      expect(mockExit).toHaveBeenCalledWith(1);
      process.exit = originalExit;
    });

    test('handles error when creating card', async () => {
      mockApiClient.createCard.mockRejectedValue(new Error('Validation error'));
      const originalExit = process.exit;
      const mockExit = jest.fn();
      process.exit = mockExit;

      await cardCreate({ title: 'Test' });

      expect(mockLogger.failure).toHaveBeenCalledWith('Failed to create card: Validation error');
      expect(mockExit).toHaveBeenCalledWith(1);
      process.exit = originalExit;
    });
  });

  describe('cardUpdate', () => {
    test('updates a card with title', async () => {
      const mockCard = { id: '1', title: 'Updated', status: 'TODO' };
      mockApiClient.updateCard.mockResolvedValue(mockCard);

      const originalLog = console.log;
      const mockLog = jest.fn();
      console.log = mockLog;

      await cardUpdate({ id: '1', title: 'Updated' });

      expect(mockApiClient.updateCard).toHaveBeenCalledWith('1', { title: 'Updated' });
      expect(mockLog).toHaveBeenCalledWith(JSON.stringify(mockCard, null, 2));
      expect(mockLogger.success).toHaveBeenCalledWith('Card updated successfully');
      console.log = originalLog;
    });

    test('handles missing id', async () => {
      const originalExit = process.exit;
      const mockExit = jest.fn();
      process.exit = mockExit;

      await cardUpdate({ title: 'Updated' });

      expect(mockLogger.error).toHaveBeenCalledWith('Card ID is required');
      expect(mockExit).toHaveBeenCalledWith(1);
      process.exit = originalExit;
    });

    test('handles no update fields', async () => {
      const originalExit = process.exit;
      const mockExit = jest.fn();
      process.exit = mockExit;

      await cardUpdate({ id: '1' });

      expect(mockLogger.error).toHaveBeenCalledWith('At least one update field is required');
      expect(mockExit).toHaveBeenCalledWith(1);
      process.exit = originalExit;
    });

    test('handles empty title in update', async () => {
      const originalExit = process.exit;
      const mockExit = jest.fn();
      process.exit = mockExit;

      await cardUpdate({ id: '1', title: '' });

      expect(mockLogger.error).toHaveBeenCalledWith('Title cannot be empty');
      expect(mockExit).toHaveBeenCalledWith(1);
      process.exit = originalExit;
    });

    test('handles whitespace-only title in update', async () => {
      const originalExit = process.exit;
      const mockExit = jest.fn();
      process.exit = mockExit;

      await cardUpdate({ id: '1', title: '   ' });

      expect(mockLogger.error).toHaveBeenCalledWith('Title cannot be empty');
      expect(mockExit).toHaveBeenCalledWith(1);
      process.exit = originalExit;
    });

    test('handles error when updating card', async () => {
      mockApiClient.updateCard.mockRejectedValue(new Error('Card not found'));
      const originalExit = process.exit;
      const mockExit = jest.fn();
      process.exit = mockExit;

      await cardUpdate({ id: '1', title: 'Updated' });

      expect(mockLogger.failure).toHaveBeenCalledWith('Failed to update card: Card not found');
      expect(mockExit).toHaveBeenCalledWith(1);
      process.exit = originalExit;
    });
  });

  describe('cardDelete', () => {
    test('deletes a card', async () => {
      mockApiClient.deleteCard.mockResolvedValue({ message: 'Card deleted' });

      await cardDelete({ id: '1' });

      expect(mockApiClient.deleteCard).toHaveBeenCalledWith('1');
      expect(mockLogger.success).toHaveBeenCalledWith('Card deleted successfully');
    });

    test('handles missing id', async () => {
      const originalExit = process.exit;
      const mockExit = jest.fn();
      process.exit = mockExit;

      await cardDelete({});

      expect(mockLogger.error).toHaveBeenCalledWith('Card ID is required');
      expect(mockExit).toHaveBeenCalledWith(1);
      process.exit = originalExit;
    });

    test('handles error when deleting card', async () => {
      mockApiClient.deleteCard.mockRejectedValue(new Error('Card not found'));
      const originalExit = process.exit;
      const mockExit = jest.fn();
      process.exit = mockExit;

      await cardDelete({ id: '1' });

      expect(mockLogger.failure).toHaveBeenCalledWith('Failed to delete card: Card not found');
      expect(mockExit).toHaveBeenCalledWith(1);
      process.exit = originalExit;
    });
  });
});