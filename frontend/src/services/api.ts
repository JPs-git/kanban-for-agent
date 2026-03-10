import type { Card, CardCreate, CardUpdate } from '../types';

const API_URL = 'http://localhost:3000/api/cards';

export const getCards = async (): Promise<Card[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Failed to get cards');
  }
  return response.json();
};

export const createCard = async (card: CardCreate): Promise<Card> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(card),
  });
  if (!response.ok) {
    throw new Error('Failed to create card');
  }
  return response.json();
};

export const updateCard = async (id: string, card: CardUpdate): Promise<Card> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(card),
  });
  if (!response.ok) {
    throw new Error('Failed to update card');
  }
  return response.json();
};

export const deleteCard = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete card');
  }
};