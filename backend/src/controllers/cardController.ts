import { Request, Response, NextFunction } from 'express';
import { CardService } from '../services/index.js';
import { SQLiteCardRepository } from '../repositories/index.js';
import { getParam } from '../utils/request.js';

const cardRepository = new SQLiteCardRepository();
const cardService = new CardService(cardRepository);

export const getCards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cards = cardService.find();
    res.status(200).json(cards);
  } catch (error) {
    next(error);
  }
};

export const getCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cardId = getParam(req, 'id')!;
    const card = cardService.findById(cardId);
    res.status(200).json(card);
  } catch (error) {
    next(error);
  }
};

export const createCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, content, status, assignee, assigneeName } = req.body;
    const savedCard = cardService.create({
      title,
      content,
      status,
      assignee,
      assigneeName,
    });
    res.status(201).json(savedCard);
  } catch (error) {
    next(error);
  }
};

export const updateCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cardId = getParam(req, 'id')!;
    const { title, content, status, assignee, assigneeName } = req.body;
    const card = cardService.update(cardId, {
      title,
      content,
      status,
      assignee,
      assigneeName,
    });
    res.status(200).json(card);
  } catch (error) {
    next(error);
  }
};

export const deleteCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cardId = getParam(req, 'id')!;
    cardService.delete(cardId);
    res.status(200).json({ message: 'Card deleted successfully' });
  } catch (error) {
    next(error);
  }
};
