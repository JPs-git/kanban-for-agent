import { Request, Response } from 'express';
import { Card, CardStatus } from '../models/Card.js';

export const getCards = async (req: Request, res: Response) => {
  try {
    const cards = Card.find();
    res.status(200).json(cards);
  } catch {
    res.status(500).json({ error: 'Failed to get cards' });
  }
};

export const getCard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cardId = Array.isArray(id) ? id[0] : id;
    
    const card = Card.findById(cardId);
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    res.status(200).json(card);
  } catch {
    res.status(500).json({ error: 'Failed to get card' });
  }
};

export const createCard = async (req: Request, res: Response) => {
  try {
    const { title, content, status, assignee, assigneeName } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const savedCard = Card.create({
      title,
      content,
      status: status || CardStatus.TODO,
      assignee,
      assigneeName
    });
    res.status(201).json(savedCard);
  } catch {
    res.status(500).json({ error: 'Failed to create card' });
  }
};

export const updateCard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, status, assignee, assigneeName } = req.body;
    
    console.log('Updating card with id:', id);
    console.log('Update data:', { title, content, status, assignee, assigneeName });
    
    const cardId = Array.isArray(id) ? id[0] : id;
    const card = Card.findByIdAndUpdate(
      cardId,
      { title, content, status, assignee, assigneeName }
    );
    
    console.log('Updated card:', card);
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    res.status(200).json(card);
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ error: 'Failed to update card' });
  }
};

export const deleteCard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const cardId = Array.isArray(id) ? id[0] : id;
    const card = Card.findByIdAndDelete(cardId);
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    res.status(200).json({ message: 'Card deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to delete card' });
  }
};
