import React from 'react';
import { useDrop } from 'react-dnd';
import type { Card as CardType } from '../types';
import { CardStatus } from '../types';
import Card from './Card';

interface StatusColumnProps {
  status: CardStatus;
  cards: Partial<CardType>[];
  onCardDrop: (cardId: string, newStatus: CardStatus) => void;
  onDeleteCard: (cardId: string) => void;
  onEditCard: (card: Partial<CardType>) => void;
}

const StatusColumn: React.FC<StatusColumnProps> = ({ 
  status, 
  cards, 
  onCardDrop, 
  onDeleteCard, 
  onEditCard 
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'CARD',
    drop: (item: { id: string }) => {
      if (item.id) {
        onCardDrop(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const statusLabels: Record<CardStatus, string> = {
    [CardStatus.TODO]: '待处理',
    [CardStatus.IN_PROGRESS]: '进行中',
    [CardStatus.DONE]: '已完成',
    [CardStatus.REJECTED]: '已拒绝'
  };

  return (
    <div 
      ref={drop as any}
      className="status-column"
      style={{
        backgroundColor: isOver ? '#f0f0f0' : '#f9f9f9',
      }}
    >
      <div className="column-header">
        <h2>{statusLabels[status]}</h2>
        <span className="card-count">{cards.length}</span>
      </div>
      <div className="column-content">
        {cards.map((card) => (
          <Card 
            key={card._id} 
            card={card} 
            onDelete={onDeleteCard} 
            onEdit={onEditCard}
          />
        ))}
      </div>
    </div>
  );
};

export default StatusColumn;