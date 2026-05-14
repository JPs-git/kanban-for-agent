import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useKanban } from './useKanban';
import * as api from '../services/api';
import type { Card, CardCreate } from '../types';
import { CardStatus } from '../types';

vi.mock('../services/api');

describe('useKanban Hook', () => {
  const mockCards: Card[] = [
    { id: '1', title: 'Test Card 1', description: 'Desc 1', status: CardStatus.TODO, userId: null },
    { id: '2', title: 'Test Card 2', description: 'Desc 2', status: CardStatus.IN_PROGRESS, userId: 'user1' },
  ];

  const mockNewCard: Card = { id: '3', title: 'New Card', description: 'New Desc', status: CardStatus.TODO, userId: null };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('initializes with loading state and fetches cards', async () => {
    (api.getCards as vi.Mock).mockResolvedValue(mockCards);

    const { result } = renderHook(() => useKanban());

    expect(result.current.loading).toBe(true);
    expect(result.current.cards).toEqual([]);
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.cards).toEqual(mockCards);
      expect(api.getCards).toHaveBeenCalledTimes(1);
    });
  });

  test('handles error when fetching cards', async () => {
    const mockError = new Error('Failed to fetch cards');
    (api.getCards as vi.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useKanban());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Failed to fetch cards');
      expect(result.current.cards).toEqual([]);
    });
  });

  test('adds a new card', async () => {
    (api.getCards as vi.Mock).mockResolvedValue(mockCards);
    (api.createCard as vi.Mock).mockResolvedValue(mockNewCard);

    const { result } = renderHook(() => useKanban());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const cardCreate: CardCreate = { title: 'New Card', description: 'New Desc' };
    
    await act(async () => {
      await result.current.addCard(cardCreate);
    });

    expect(api.createCard).toHaveBeenCalledWith(cardCreate);
    expect(result.current.cards).toContainEqual(mockNewCard);
    expect(result.current.cards.length).toBe(3);
  });

  test('handles error when adding card', async () => {
    (api.getCards as vi.Mock).mockResolvedValue(mockCards);
    (api.createCard as vi.Mock).mockRejectedValue(new Error('Failed to create'));

    const { result } = renderHook(() => useKanban());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const cardCreate: CardCreate = { title: 'New Card', description: 'New Desc' };
    
    await act(async () => {
      await expect(result.current.addCard(cardCreate)).rejects.toThrow();
    });

    expect(result.current.error).toBe('Failed to create card');
    expect(result.current.cards.length).toBe(2);
  });

  test('updates card status', async () => {
    (api.getCards as vi.Mock).mockResolvedValue(mockCards);
    const updatedCard = { ...mockCards[0], status: CardStatus.DONE };
    (api.updateCard as vi.Mock).mockResolvedValue(updatedCard);

    const { result } = renderHook(() => useKanban());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateCardStatus('1', CardStatus.DONE);
    });

    expect(api.updateCard).toHaveBeenCalledWith('1', { status: CardStatus.DONE });
    expect(result.current.cards[0].status).toBe(CardStatus.DONE);
  });

  test('removes a card', async () => {
    (api.getCards as vi.Mock).mockResolvedValue(mockCards);
    (api.deleteCard as vi.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useKanban());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.removeCard('1');
    });

    expect(api.deleteCard).toHaveBeenCalledWith('1');
    expect(result.current.cards.length).toBe(1);
    expect(result.current.cards[0].id).toBe('2');
  });

  test('refreshes cards when fetchCards is called', async () => {
    const newCards: Card[] = [{ id: '3', title: 'Refreshed', description: 'New', status: CardStatus.TODO, userId: null }];
    (api.getCards as vi.Mock).mockResolvedValueOnce(mockCards).mockResolvedValueOnce(newCards);

    const { result } = renderHook(() => useKanban());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cards).toEqual(mockCards);

    await act(async () => {
      await result.current.fetchCards();
    });

    expect(api.getCards).toHaveBeenCalledTimes(2);
    await waitFor(() => {
      expect(result.current.cards).toEqual(newCards);
    });
  });
});