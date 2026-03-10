import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import type { Card as CardType } from '../types';
import { CardStatus } from '../types';

interface CardProps {
  card: CardType;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: { title?: string; content?: string; status?: CardStatus }) => void;
}

const Card: React.FC<CardProps> = ({ card, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editContent, setEditContent] = useState(card.content);
  
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

  const handleSave = () => {
    if (editTitle.trim() && editContent.trim()) {
      onUpdate(card._id, {
        title: editTitle,
        content: editContent
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(card.title);
    setEditContent(card.content);
    setIsEditing(false);
  };

  return (
    <div
      ref={drag as any}
      className="card"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grab' : 'pointer',
      }}
      onClick={() => !isDragging && !isEditing && setIsEditing(true)}
    >
      {isEditing ? (
        <div className="card-edit">
          <div className="card-header">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="edit-input"
              placeholder="Card title"
              autoFocus
            />
            <div className="edit-buttons">
              <button 
                className="save-button" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
              >
                ✔
              </button>
              <button 
                className="cancel-button" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
              >
                ✖
              </button>
            </div>
          </div>
          <div className="card-content">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="edit-textarea"
              placeholder="Card content"
              rows={3}
            />
          </div>
          <div className="card-footer">
            <span className="card-status">{statusLabels[card.status as CardStatus]}</span>
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
        </div>
      ) : (
        <>
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
          <div className="card-footer">
            <span className="card-status">{statusLabels[card.status as CardStatus]}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default Card;