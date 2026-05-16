import { useState, useEffect } from "react";
import type { Card, CardCreate } from "../types";
import { CardStatus } from "../types";
import * as api from "../services/api";
import { useErrorHandler } from "./useErrorHandler";

export const useKanban = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { handleError, wrapAsync } = useErrorHandler();

  const fetchCards = async () => {
    try {
      setLoading(true);
      const data = await api.getCards();
      setCards(data);
    } catch (err) {
      handleError(err, "获取卡片列表失败");
    } finally {
      setLoading(false);
    }
  };

  const addCard = async (card: CardCreate) => {
    return wrapAsync(async () => {
      const newCard = await api.createCard(card);
      setCards((prev) => [...prev, newCard]);
      return newCard;
    }, "创建卡片失败");
  };

  const updateCardStatus = async (id: string, status: CardStatus) => {
    return wrapAsync(async () => {
      const updatedCard = await api.updateCard(id, { status });
      setCards((prev) =>
        prev.map((card) => (card.id === id ? updatedCard : card)),
      );
      return updatedCard;
    }, "更新卡片状态失败");
  };

  const updateCard = async (
    id: string,
    updates: Partial<Omit<Card, "id" | "createdAt" | "updatedAt">>,
  ) => {
    return wrapAsync(async () => {
      const updatedCard = await api.updateCard(id, updates);
      setCards((prev) =>
        prev.map((card) => (card.id === id ? updatedCard : card)),
      );
      return updatedCard;
    }, "更新卡片失败");
  };

  const removeCard = async (id: string) => {
    return wrapAsync(async () => {
      await api.deleteCard(id);
      setCards((prev) => prev.filter((card) => card.id !== id));
      return true;
    }, "删除卡片失败");
  };

  useEffect(() => {
    fetchCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally only run on mount

  return {
    cards,
    loading,
    fetchCards,
    addCard,
    updateCard,
    updateCardStatus,
    removeCard,
  };
};
