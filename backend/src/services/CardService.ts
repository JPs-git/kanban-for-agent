import { Card, CardStatus } from '../models/Card.js';
import { CardRepository } from '../repositories/index.js';
import { ValidationError, NotFoundError, BusinessRuleError } from '../errors/index.js';
import type { BusinessRuleCode } from '../errors/index.js';

export class CardService {
  constructor(private cardRepository: CardRepository) {}

  find(): Card[] {
    return this.cardRepository.find();
  }

  findById(uuid: string): Card {
    const card = this.cardRepository.findById(uuid);
    if (!card) {
      throw new NotFoundError('Card not found', { field: 'id', reason: 'card does not exist' });
    }
    return card;
  }

  create(cardData: {
    title: string;
    content?: string;
    status?: CardStatus;
    assignee?: string;
    assigneeName?: string;
  }): Card {
    if (!cardData.title || cardData.title.trim() === '') {
      throw new ValidationError('Title is required', { field: 'title', reason: 'must not be empty' });
    }

    if (cardData.status && !Object.values(CardStatus).includes(cardData.status)) {
      throw new ValidationError('Invalid status', { field: 'status', reason: 'must be one of: TODO, IN_PROGRESS, DONE, REJECTED' });
    }

    if (cardData.assignee && !cardData.assigneeName) {
      throw new ValidationError('Assignee name is required when assigning', { field: 'assigneeName', reason: 'must be provided when assignee is set' });
    }

    return this.cardRepository.create(cardData);
  }

  update(uuid: string, updateData: {
    title?: string;
    content?: string;
    status?: CardStatus;
    assignee?: string;
    assigneeName?: string;
  }): Card {
    const existingCard = this.cardRepository.findById(uuid);
    if (!existingCard) {
      throw new NotFoundError('Card not found', { field: 'id', reason: 'card does not exist' });
    }

    if (updateData.title !== undefined && updateData.title.trim() === '') {
      throw new ValidationError('Title cannot be empty', { field: 'title', reason: 'must not be empty' });
    }

    if (updateData.status !== undefined) {
      if (!Object.values(CardStatus).includes(updateData.status)) {
        throw new ValidationError('Invalid status', { field: 'status', reason: 'must be one of: TODO, IN_PROGRESS, DONE, REJECTED' });
      }
      if (updateData.status !== existingCard.status) {
        this.validateStatusTransition(existingCard.status, updateData.status);
      }
    }

    if (updateData.assignee && !updateData.assigneeName) {
      throw new ValidationError('Assignee name is required when assigning', { field: 'assigneeName', reason: 'must be provided when assignee is set' });
    }

    const updatedCard = this.cardRepository.update(uuid, updateData);
    if (!updatedCard) {
      throw new NotFoundError('Card not found', { field: 'id', reason: 'card does not exist' });
    }
    return updatedCard;
  }

  delete(uuid: string): Card {
    const card = this.cardRepository.findById(uuid);
    if (!card) {
      throw new NotFoundError('Card not found', { field: 'id', reason: 'card does not exist' });
    }
    const deletedCard = this.cardRepository.delete(uuid);
    if (!deletedCard) {
      throw new NotFoundError('Card not found', { field: 'id', reason: 'card does not exist' });
    }
    return deletedCard;
  }

  private getBusinessRuleCode(currentStatus: CardStatus, newStatus: CardStatus): BusinessRuleCode {
    if (currentStatus === CardStatus.DONE && newStatus === CardStatus.REJECTED) {
      return 'CARD_NOT_TRANSITIONABLE_TO_REJECTED';
    }
    if (currentStatus === CardStatus.TODO && newStatus === CardStatus.DONE) {
      return 'CARD_MUST_BE_STARTED_BEFORE_COMPLETION';
    }
    if (currentStatus === CardStatus.IN_PROGRESS && newStatus === CardStatus.TODO) {
      return 'CARD_CANNOT_BE_REOPENED';
    }
    return 'INVALID_STATUS_TRANSITION';
  }

  private validateStatusTransition(currentStatus: CardStatus, newStatus: CardStatus): void {
    const validTransitions: Record<CardStatus, CardStatus[]> = {
      [CardStatus.TODO]: [CardStatus.IN_PROGRESS, CardStatus.REJECTED],
      [CardStatus.IN_PROGRESS]: [CardStatus.DONE, CardStatus.REJECTED],
      [CardStatus.DONE]: [CardStatus.IN_PROGRESS],
      [CardStatus.REJECTED]: [CardStatus.TODO],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      const ruleCode = this.getBusinessRuleCode(currentStatus, newStatus);
      throw new BusinessRuleError(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
        ruleCode,
        { field: 'status', reason: `valid transitions from ${currentStatus}: ${validTransitions[currentStatus].join(', ')}` }
      );
    }
  }
}