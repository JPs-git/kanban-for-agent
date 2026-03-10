import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CardStatus } from '../types';
import type { Card, CardCreate } from '../types';
import { useKanban } from '../hooks/useKanban';
import StatusColumn from './StatusColumn';

const KanbanBoard: React.FC = () => {
  const { cards, loading, error, addCard, updateCardStatus, removeCard, fetchCards } = useKanban();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState<CardCreate>({
    title: '',
    content: '',
    status: CardStatus.TODO
  });

  // 按状态分组卡片
  const groupedCards = cards.reduce((acc, card) => {
    if (!acc[card.status]) {
      acc[card.status] = [];
    }
    acc[card.status].push(card);
    return acc;
  }, {} as Record<CardStatus, Card[]>);

  // 处理卡片拖放
  const handleCardDrop = (cardId: string, newStatus: CardStatus) => {
    updateCardStatus(cardId, newStatus);
  };

  // 处理卡片更新
  const handleCardUpdate = (id: string, updates: { title?: string; content?: string; status?: CardStatus }) => {
    // 这里可以添加更新卡片的逻辑
    // 目前updateCardStatus只更新状态，我们需要添加一个新的API调用或修改现有函数
    // 为了简化，我们可以直接调用API的updateCard函数
    import('../services/api').then((api) => {
      api.updateCard(id, updates).then((updatedCard) => {
        // 刷新卡片列表
        fetchCards();
      }).catch((error) => {
        console.error('Failed to update card:', error);
      });
    });
  };

  // 处理添加卡片
  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCard.title && newCard.content) {
      await addCard(newCard);
      setNewCard({ title: '', content: '', status: CardStatus.TODO });
      setShowAddForm(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="kanban-board">
        <div className="board-header">
          <h1>Kanban Board</h1>
          <button 
            className="add-button"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : 'Add Card'}
          </button>
        </div>

        {showAddForm && (
          <form className="add-card-form" onSubmit={handleAddCard}>
            <input
              type="text"
              placeholder="Card title"
              value={newCard.title}
              onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Card content"
              value={newCard.content}
              onChange={(e) => setNewCard({ ...newCard, content: e.target.value })}
              required
            />
            <select
              value={newCard.status}
              onChange={(e) => setNewCard({ ...newCard, status: e.target.value as CardStatus })}
            >
              {Object.values(CardStatus).map((status) => {
                const statusLabels: Record<CardStatus, string> = {
                  [CardStatus.TODO]: '待处理',
                  [CardStatus.IN_PROGRESS]: '进行中',
                  [CardStatus.DONE]: '已完成',
                  [CardStatus.REJECTED]: '已拒绝'
                };
                return (
                  <option key={status} value={status}>{statusLabels[status]}</option>
                );
              })}
            </select>
            <button type="submit">Create Card</button>
          </form>
        )}

        <div className="board-content">
          {Object.values(CardStatus).map((status) => (
            <StatusColumn
              key={status}
              status={status}
              cards={groupedCards[status] || []}
              onCardDrop={handleCardDrop}
              onDeleteCard={removeCard}
              onUpdateCard={handleCardUpdate}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default KanbanBoard;