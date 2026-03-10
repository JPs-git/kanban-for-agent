import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import type { Card as CardType } from '../types';
import { CardStatus } from '../types';

interface CardProps {
  card: CardType;
  onDelete: (id: string) => void;
  onEdit: (card: CardType) => void;
}

// 模拟用户数据
const mockUsers = [
  { id: '1', name: '张三' },
  { id: '2', name: '李四' },
  { id: '3', name: '王五' },
  { id: '4', name: '赵六' }
];

const Card: React.FC<CardProps> = ({ card, onDelete, onEdit }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'CARD',
    item: { id: card._id, status: card.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const statusLabels: Record<CardStatus, string> = {
    [CardStatus.TODO]: '待处理',
    [CardStatus.IN_PROGRESS]: '进行中',
    [CardStatus.DONE]: '已完成',
    [CardStatus.REJECTED]: '已拒绝'
  };

  const getAssigneeDisplayName = () => {
    return card.assigneeName || '未分配';
  };

  return (
    <div
      ref={drag as any}
      className="card"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grab' : 'pointer',
      }}
      onClick={() => !isDragging && onEdit(card)}
    >
      <div className="card-header">
        <h3>{card.title}</h3>
        <button 
          className="delete-button" 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(card._id);
          }}
          aria-label="Delete card"
        >
          ×
        </button>
      </div>
      <div className="card-content">
        <p>{card.content}</p>
      </div>
      <div className="card-assignee-display">
        <span className="assignee-label">分配给：</span>
        <span className="assignee-name">{getAssigneeDisplayName()}</span>
      </div>
      <div className="card-footer">
        <span className="card-status">{statusLabels[card.status as CardStatus]}</span>
      </div>
    </div>
  );
};

export default Card;