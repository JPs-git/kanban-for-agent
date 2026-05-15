import { Card, CardStatus } from '../models/Card';

export abstract class CardRepository {
  abstract find(): Card[];
  abstract findById(uuid: string): Card | undefined;
  abstract create(cardData: {
    title: string;
    content?: string;
    status?: CardStatus;
    assignee?: string;
    assigneeName?: string;
  }): Card;
  abstract update(uuid: string, updateData: {
    title?: string;
    content?: string;
    status?: CardStatus;
    assignee?: string;
    assigneeName?: string;
  }): Card | undefined;
  abstract delete(uuid: string): Card | undefined;
}