import { describe, test, expect, jest } from '@jest/globals';
import { CardService } from '../../src/services/CardService';
import { CardRepository } from '../../src/repositories/CardRepository';
import { Card, CardStatus } from '../../src/models/Card';
import { ValidationError, NotFoundError, BusinessRuleError } from '../../src/errors';

const createMockCard = (overrides: Partial<Card> = {}): Card => ({
  id: 'test-uuid',
  title: 'Test Card',
  content: 'Test content',
  status: CardStatus.TODO,
  assignee: null,
  assigneeName: '未分配',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('CardService', () => {
  let mockRepository: jest.Mocked<CardRepository>;
  let service: CardService;

  beforeEach(() => {
    mockRepository = {
      find: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    service = new CardService(mockRepository);
  });

  describe('find', () => {
    test('should return all cards from repository', () => {
      const cards = [createMockCard()];
      mockRepository.find.mockReturnValue(cards);

      const result = service.find();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(cards);
    });
  });

  describe('findById', () => {
    test('should return card when found', () => {
      const card = createMockCard();
      mockRepository.findById.mockReturnValue(card);

      const result = service.findById('test-uuid');

      expect(mockRepository.findById).toHaveBeenCalledWith('test-uuid');
      expect(result).toEqual(card);
    });

    test('should throw NotFoundError when card not found', () => {
      mockRepository.findById.mockReturnValue(undefined);

      expect(() => service.findById('non-existent')).toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    test('should create card with valid data', () => {
      const cardData = { title: 'New Card' };
      const createdCard = createMockCard({ title: 'New Card' });
      mockRepository.create.mockReturnValue(createdCard);

      const result = service.create(cardData);

      expect(mockRepository.create).toHaveBeenCalledWith(cardData);
      expect(result).toEqual(createdCard);
    });

    test('should throw ValidationError when title is empty', () => {
      expect(() => service.create({ title: '' })).toThrow(ValidationError);
      expect(() => service.create({ title: '   ' })).toThrow(ValidationError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    test('should throw ValidationError when title is missing', () => {
      // @ts-expect-error testing missing title
      expect(() => service.create({})).toThrow(ValidationError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    test('should throw ValidationError when status is invalid', () => {
      expect(() => 
        service.create({ title: 'Test', status: 'INVALID' as CardStatus })
      ).toThrow(ValidationError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    test('should update card with valid data', () => {
      const existingCard = createMockCard();
      const updatedCard = createMockCard({ title: 'Updated', status: CardStatus.IN_PROGRESS });
      mockRepository.findById.mockReturnValue(existingCard);
      mockRepository.update.mockReturnValue(updatedCard);

      const result = service.update('test-uuid', { title: 'Updated', status: CardStatus.IN_PROGRESS });

      expect(mockRepository.findById).toHaveBeenCalledWith('test-uuid');
      expect(mockRepository.update).toHaveBeenCalledWith('test-uuid', { title: 'Updated', status: CardStatus.IN_PROGRESS });
      expect(result).toEqual(updatedCard);
    });

    test('should throw NotFoundError when card not found', () => {
      mockRepository.findById.mockReturnValue(undefined);

      expect(() => service.update('non-existent', { title: 'Updated' })).toThrow(NotFoundError);
    });

    test('should throw ValidationError when title is empty string', () => {
      const existingCard = createMockCard();
      mockRepository.findById.mockReturnValue(existingCard);

      expect(() => service.update('test-uuid', { title: '' })).toThrow(ValidationError);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    test('should throw BusinessRuleError when status transition is invalid', () => {
      const existingCard = createMockCard({ status: CardStatus.TODO });
      mockRepository.findById.mockReturnValue(existingCard);

      expect(() => 
        service.update('test-uuid', { status: CardStatus.DONE })
      ).toThrow(BusinessRuleError);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    test('should allow valid status transitions', () => {
      const existingCard = createMockCard({ status: CardStatus.IN_PROGRESS });
      const updatedCard = createMockCard({ status: CardStatus.DONE });
      mockRepository.findById.mockReturnValue(existingCard);
      mockRepository.update.mockReturnValue(updatedCard);

      const result = service.update('test-uuid', { status: CardStatus.DONE });

      expect(mockRepository.update).toHaveBeenCalled();
      expect(result.status).toBe(CardStatus.DONE);
    });

    test('should throw ValidationError when assignee set without assigneeName', () => {
      const existingCard = createMockCard();
      mockRepository.findById.mockReturnValue(existingCard);

      expect(() => service.update('test-uuid', { assignee: 'user-uuid' })).toThrow(ValidationError);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    test('should throw ValidationError when status is invalid', () => {
      const existingCard = createMockCard();
      mockRepository.findById.mockReturnValue(existingCard);

      expect(() => 
        service.update('test-uuid', { status: 'INVALID' as CardStatus })
      ).toThrow(ValidationError);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    test('should throw NotFoundError when repository update returns undefined', () => {
      const existingCard = createMockCard();
      mockRepository.findById.mockReturnValue(existingCard);
      mockRepository.update.mockReturnValue(undefined);

      expect(() => service.update('test-uuid', { title: 'Updated' })).toThrow(NotFoundError);
    });

    test('should allow update with only assigneeName (unassign)', () => {
      const existingCard = createMockCard({ assignee: 'user-uuid', assigneeName: 'User' });
      const updatedCard = createMockCard({ assignee: null, assigneeName: '未分配' });
      mockRepository.findById.mockReturnValue(existingCard);
      mockRepository.update.mockReturnValue(updatedCard);

      const result = service.update('test-uuid', { assignee: null, assigneeName: '未分配' });

      expect(mockRepository.update).toHaveBeenCalled();
      expect(result.assignee).toBeNull();
    });
  });

  describe('delete', () => {
    test('should delete existing card', () => {
      const card = createMockCard();
      mockRepository.findById.mockReturnValue(card);
      mockRepository.delete.mockReturnValue(card);

      const result = service.delete('test-uuid');

      expect(mockRepository.findById).toHaveBeenCalledWith('test-uuid');
      expect(mockRepository.delete).toHaveBeenCalledWith('test-uuid');
      expect(result).toEqual(card);
    });

    test('should throw NotFoundError when card not found', () => {
      mockRepository.findById.mockReturnValue(undefined);

      expect(() => service.delete('non-existent')).toThrow(NotFoundError);
    });

    test('should throw NotFoundError when repository delete returns undefined', () => {
      const card = createMockCard();
      mockRepository.findById.mockReturnValue(card);
      mockRepository.delete.mockReturnValue(undefined);

      expect(() => service.delete('test-uuid')).toThrow(NotFoundError);
    });
  });
});