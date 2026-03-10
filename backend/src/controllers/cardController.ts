import { Request, Response } from 'express';
import { Card, CardStatus } from '../models/Card';

export const getCards = async (req: Request, res: Response) => {
  try {
    const cards = await Card.find();
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cards' });
  }
};

export const createCard = async (req: Request, res: Response) => {
  try {
    const { title, content, status } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const card = new Card({
      title,
      content,
      status: status || CardStatus.TODO
    });
    
    const savedCard = await card.save();
    res.status(201).json(savedCard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create card' });
  }
};

export const updateCard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, status } = req.body;
    
    console.log('Updating card with id:', id);
    console.log('Update data:', { title, content, status });
    
    const card = await Card.findByIdAndUpdate(
      id,
      { title, content, status },
      { returnDocument: 'after', runValidators: true }
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
    
    const card = await Card.findByIdAndDelete(id);
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    res.status(200).json({ message: 'Card deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete card' });
  }
};