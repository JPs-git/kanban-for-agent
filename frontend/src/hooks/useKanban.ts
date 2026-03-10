import { useState, useEffect } from 'react';
import type { Card, CardCreate } from '../types';
import { CardStatus } from '../types';
import * as api from '../services/api';

export const useKanban = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 获取所有卡片
  const fetchCards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCards();
      setCards(data);
    } catch (err) {
      setError('Failed to fetch cards');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 创建新卡片
  const addCard = async (card: CardCreate) => {
    try {
      const newCard = await api.createCard(card);
      setCards(prev => [...prev, newCard]);
      return newCard;
    } catch (err) {
      setError('Failed to create card');
      console.error(err);
      throw err;
    }
  };

  // 更新卡片
  const updateCardStatus = async (id: string, status: CardStatus) => {
    try {
      const updatedCard = await api.updateCard(id, { status });
      setCards(prev => prev.map(card => card._id === id ? updatedCard : card));
      return updatedCard;
    } catch (err) {
      setError('Failed to update card');
      console.error(err);
      throw err;
    }
  };

  // 删除卡片
  const removeCard = async (id: string) => {
    try {
      await api.deleteCard(id);
      setCards(prev => prev.filter(card => card._id !== id));
    } catch (err) {
      setError('Failed to delete card');
      console.error(err);
      throw err;
    }
  };

  // 初始化时获取卡片
  useEffect(() => {
    fetchCards();
  }, []);

  return {
    cards,
    loading,
    error,
    fetchCards,
    addCard,
    updateCardStatus,
    removeCard
  };
};