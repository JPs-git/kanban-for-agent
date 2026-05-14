import { describe, test, expect, vi, beforeEach } from 'vitest';
import * as api from './api';
import type { Card } from '../types';
import { CardStatus } from '../types';

global.fetch = vi.fn();

describe('API Service', () => {
  const mockCard: Card = { id: '1', title: 'Test', description: 'Desc', status: CardStatus.TODO, userId: null };
  const mockCards: Card[] = [mockCard];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getVersion', () => {
    test('returns version info on success', async () => {
      (fetch as vi.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve({ version: '0.8.3', environment: 'test' }) });
      const result = await api.getVersion();
      expect(result).toEqual({ version: '0.8.3', environment: 'test' });
    });

    test('throws error on failure', async () => {
      (fetch as vi.Mock).mockResolvedValue({ ok: false });
      await expect(api.getVersion()).rejects.toThrow('Failed to get version');
    });
  });

  describe('getCards', () => {
    test('returns cards on success', async () => {
      (fetch as vi.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve(mockCards) });
      const result = await api.getCards();
      expect(result).toEqual(mockCards);
    });

    test('throws error on failure', async () => {
      (fetch as vi.Mock).mockResolvedValue({ ok: false });
      await expect(api.getCards()).rejects.toThrow('Failed to get cards');
    });
  });

  describe('createCard', () => {
    test('creates card and returns it', async () => {
      (fetch as vi.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve(mockCard) });
      const result = await api.createCard({ title: 'Test', description: 'Desc' });
      expect(result).toEqual(mockCard);
    });

    test('throws error on failure', async () => {
      (fetch as vi.Mock).mockResolvedValue({ ok: false });
      await expect(api.createCard({ title: 'Test', description: 'Desc' })).rejects.toThrow('Failed to create card');
    });
  });

  describe('updateCard', () => {
    test('updates card and returns it', async () => {
      const updatedCard = { ...mockCard, status: CardStatus.DONE };
      (fetch as vi.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve(updatedCard) });
      const result = await api.updateCard('1', { status: CardStatus.DONE });
      expect(result.status).toBe(CardStatus.DONE);
    });

    test('throws error on failure', async () => {
      (fetch as vi.Mock).mockResolvedValue({ ok: false });
      await expect(api.updateCard('1', { status: CardStatus.DONE })).rejects.toThrow('Failed to update card');
    });
  });

  describe('deleteCard', () => {
    test('deletes card successfully', async () => {
      (fetch as vi.Mock).mockResolvedValue({ ok: true });
      await api.deleteCard('1');
      expect(fetch).toHaveBeenCalledWith('/api/cards/1', { method: 'DELETE' });
    });

    test('throws error on failure', async () => {
      (fetch as vi.Mock).mockResolvedValue({ ok: false });
      await expect(api.deleteCard('1')).rejects.toThrow('Failed to delete card');
    });
  });
});