import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { CardService } from '../../src/services/CardService';
import { CardRepository } from '../../src/repositories/CardRepository';
import { Card, CardStatus } from '../../src/models/Card';
import { BusinessRuleError } from '../../src/errors';

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

describe('CardService - Business Rules', () => {
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

  describe('Status Transition: TODO', () => {
    test('should allow transition from TODO to IN_PROGRESS', () => {
      const existingCard = createMockCard({ status: CardStatus.TODO });
      const updatedCard = createMockCard({ status: CardStatus.IN_PROGRESS });
      mockRepository.findById.mockReturnValue(existingCard);
      mockRepository.update.mockReturnValue(updatedCard);

      const result = service.update('test-uuid', { status: CardStatus.IN_PROGRESS });

      expect(mockRepository.update).toHaveBeenCalledWith('test-uuid', { status: CardStatus.IN_PROGRESS });
      expect(result.status).toBe(CardStatus.IN_PROGRESS);
    });

    test('should allow transition from TODO to REJECTED', () => {
      const existingCard = createMockCard({ status: CardStatus.TODO });
      const updatedCard = createMockCard({ status: CardStatus.REJECTED });
      mockRepository.findById.mockReturnValue(existingCard);
      mockRepository.update.mockReturnValue(updatedCard);

      const result = service.update('test-uuid', { status: CardStatus.REJECTED });

      expect(mockRepository.update).toHaveBeenCalledWith('test-uuid', { status: CardStatus.REJECTED });
      expect(result.status).toBe(CardStatus.REJECTED);
    });

    test('should throw BusinessRuleError with CARD_MUST_BE_STARTED_BEFORE_COMPLETION when transitioning from TODO to DONE', () => {
      const existingCard = createMockCard({ status: CardStatus.TODO });
      mockRepository.findById.mockReturnValue(existingCard);

      expect(() =>
        service.update('test-uuid', { status: CardStatus.DONE })
      ).toThrow(BusinessRuleError);

      try {
        service.update('test-uuid', { status: CardStatus.DONE });
      } catch (error) {
        expect((error as BusinessRuleError).ruleCode).toBe('CARD_MUST_BE_STARTED_BEFORE_COMPLETION');
      }

      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('Status Transition: IN_PROGRESS', () => {
    test('should allow transition from IN_PROGRESS to DONE', () => {
      const existingCard = createMockCard({ status: CardStatus.IN_PROGRESS });
      const updatedCard = createMockCard({ status: CardStatus.DONE });
      mockRepository.findById.mockReturnValue(existingCard);
      mockRepository.update.mockReturnValue(updatedCard);

      const result = service.update('test-uuid', { status: CardStatus.DONE });

      expect(mockRepository.update).toHaveBeenCalledWith('test-uuid', { status: CardStatus.DONE });
      expect(result.status).toBe(CardStatus.DONE);
    });

    test('should allow transition from IN_PROGRESS to REJECTED', () => {
      const existingCard = createMockCard({ status: CardStatus.IN_PROGRESS });
      const updatedCard = createMockCard({ status: CardStatus.REJECTED });
      mockRepository.findById.mockReturnValue(existingCard);
      mockRepository.update.mockReturnValue(updatedCard);

      const result = service.update('test-uuid', { status: CardStatus.REJECTED });

      expect(mockRepository.update).toHaveBeenCalledWith('test-uuid', { status: CardStatus.REJECTED });
      expect(result.status).toBe(CardStatus.REJECTED);
    });

    test('should throw BusinessRuleError with CARD_CANNOT_BE_REOPENED when transitioning from IN_PROGRESS to TODO', () => {
      const existingCard = createMockCard({ status: CardStatus.IN_PROGRESS });
      mockRepository.findById.mockReturnValue(existingCard);

      expect(() =>
        service.update('test-uuid', { status: CardStatus.TODO })
      ).toThrow(BusinessRuleError);

      try {
        service.update('test-uuid', { status: CardStatus.TODO });
      } catch (error) {
        expect((error as BusinessRuleError).ruleCode).toBe('CARD_CANNOT_BE_REOPENED');
      }

      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('Status Transition: DONE', () => {
    test('should allow transition from DONE to IN_PROGRESS', () => {
      const existingCard = createMockCard({ status: CardStatus.DONE });
      const updatedCard = createMockCard({ status: CardStatus.IN_PROGRESS });
      mockRepository.findById.mockReturnValue(existingCard);
      mockRepository.update.mockReturnValue(updatedCard);

      const result = service.update('test-uuid', { status: CardStatus.IN_PROGRESS });

      expect(mockRepository.update).toHaveBeenCalledWith('test-uuid', { status: CardStatus.IN_PROGRESS });
      expect(result.status).toBe(CardStatus.IN_PROGRESS);
    });

    test('should throw BusinessRuleError with CARD_NOT_TRANSITIONABLE_TO_REJECTED when transitioning from DONE to REJECTED', () => {
      const existingCard = createMockCard({ status: CardStatus.DONE });
      mockRepository.findById.mockReturnValue(existingCard);

      expect(() =>
        service.update('test-uuid', { status: CardStatus.REJECTED })
      ).toThrow(BusinessRuleError);

      try {
        service.update('test-uuid', { status: CardStatus.REJECTED });
      } catch (error) {
        expect((error as BusinessRuleError).ruleCode).toBe('CARD_NOT_TRANSITIONABLE_TO_REJECTED');
      }

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    test('should throw BusinessRuleError when transitioning from DONE to TODO', () => {
      const existingCard = createMockCard({ status: CardStatus.DONE });
      mockRepository.findById.mockReturnValue(existingCard);

      expect(() =>
        service.update('test-uuid', { status: CardStatus.TODO })
      ).toThrow(BusinessRuleError);

      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('Status Transition: REJECTED', () => {
    test('should allow transition from REJECTED to TODO', () => {
      const existingCard = createMockCard({ status: CardStatus.REJECTED });
      const updatedCard = createMockCard({ status: CardStatus.TODO });
      mockRepository.findById.mockReturnValue(existingCard);
      mockRepository.update.mockReturnValue(updatedCard);

      const result = service.update('test-uuid', { status: CardStatus.TODO });

      expect(mockRepository.update).toHaveBeenCalledWith('test-uuid', { status: CardStatus.TODO });
      expect(result.status).toBe(CardStatus.TODO);
    });

    test('should throw BusinessRuleError when transitioning from REJECTED to IN_PROGRESS', () => {
      const existingCard = createMockCard({ status: CardStatus.REJECTED });
      mockRepository.findById.mockReturnValue(existingCard);

      expect(() =>
        service.update('test-uuid', { status: CardStatus.IN_PROGRESS })
      ).toThrow(BusinessRuleError);

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    test('should throw BusinessRuleError when transitioning from REJECTED to DONE', () => {
      const existingCard = createMockCard({ status: CardStatus.REJECTED });
      mockRepository.findById.mockReturnValue(existingCard);

      expect(() =>
        service.update('test-uuid', { status: CardStatus.DONE })
      ).toThrow(BusinessRuleError);

      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('Same Status Update', () => {
    test('should allow updating card with same status (TODO -> TODO)', () => {
      const existingCard = createMockCard({ status: CardStatus.TODO });
      const updatedCard = createMockCard({ status: CardStatus.TODO, title: 'Updated Title' });
      mockRepository.findById.mockReturnValue(existingCard);
      mockRepository.update.mockReturnValue(updatedCard);

      const result = service.update('test-uuid', { status: CardStatus.TODO, title: 'Updated Title' });

      expect(mockRepository.update).toHaveBeenCalledWith('test-uuid', { status: CardStatus.TODO, title: 'Updated Title' });
      expect(result.title).toBe('Updated Title');
      expect(result.status).toBe(CardStatus.TODO);
    });

    test('should allow updating card with same status (IN_PROGRESS -> IN_PROGRESS)', () => {
      const existingCard = createMockCard({ status: CardStatus.IN_PROGRESS });
      const updatedCard = createMockCard({ status: CardStatus.IN_PROGRESS, content: 'Updated content' });
      mockRepository.findById.mockReturnValue(existingCard);
      mockRepository.update.mockReturnValue(updatedCard);

      const result = service.update('test-uuid', { status: CardStatus.IN_PROGRESS, content: 'Updated content' });

      expect(mockRepository.update).toHaveBeenCalledWith('test-uuid', { status: CardStatus.IN_PROGRESS, content: 'Updated content' });
      expect(result.content).toBe('Updated content');
      expect(result.status).toBe(CardStatus.IN_PROGRESS);
    });

    test('should allow updating only title without changing status', () => {
      const existingCard = createMockCard({ status: CardStatus.TODO, title: 'Original Title' });
      const updatedCard = createMockCard({ status: CardStatus.TODO, title: 'New Title' });
      mockRepository.findById.mockReturnValue(existingCard);
      mockRepository.update.mockReturnValue(updatedCard);

      const result = service.update('test-uuid', { title: 'New Title' });

      expect(mockRepository.update).toHaveBeenCalledWith('test-uuid', { title: 'New Title' });
      expect(result.title).toBe('New Title');
      expect(result.status).toBe(CardStatus.TODO);
    });
  });

  describe('Invalid Transitions', () => {
    test('should throw BusinessRuleError with INVALID_STATUS_TRANSITION for completely invalid transitions', () => {
      const existingCard = createMockCard({ status: CardStatus.IN_PROGRESS });
      mockRepository.findById.mockReturnValue(existingCard);

      expect(() =>
        service.update('test-uuid', { status: CardStatus.TODO })
      ).toThrow(BusinessRuleError);

      try {
        service.update('test-uuid', { status: CardStatus.TODO });
      } catch (error) {
        expect((error as BusinessRuleError).ruleCode).toBe('CARD_CANNOT_BE_REOPENED');
      }

      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('Business Rule Error Details', () => {
    test('should include field and reason in error details', () => {
      const existingCard = createMockCard({ status: CardStatus.TODO });
      mockRepository.findById.mockReturnValue(existingCard);

      try {
        service.update('test-uuid', { status: CardStatus.DONE });
      } catch (error) {
        const businessRuleError = error as BusinessRuleError;
        expect(businessRuleError.details).toBeDefined();
        expect(businessRuleError.details.field).toBe('status');
        expect(businessRuleError.details.reason).toContain('valid transitions from TODO');
      }
    });
  });
});
