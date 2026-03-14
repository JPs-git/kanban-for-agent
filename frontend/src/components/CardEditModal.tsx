import React, { useState, useEffect } from 'react';
import type { Card, User } from '../types';
import { CardStatus } from '../types';
import Modal from './Modal';
import Button from './Button';

interface CardEditModalProps {
  card: Partial<Card> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: { title?: string; content?: string; status?: CardStatus; assignee?: string; assigneeName?: string }) => void;
  users: User[];
}

const CardEditModal: React.FC<CardEditModalProps> = ({ card, isOpen, onClose, onSave, users }) => {
  const [editTitle, setEditTitle] = useState(card?.title || '');
  const [editContent, setEditContent] = useState(card?.content || '');
  const [editStatus, setEditStatus] = useState<CardStatus>(card?.status || CardStatus.TODO);
  const [editAssignee, setEditAssignee] = useState(card?.assignee || '');

  // 当卡片数据变化时更新状态
  // eslint-disable-next-line react-hooks/set-state-in-effect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (card) {
      setEditTitle(card.title || '');
      setEditContent(card.content || '');
      setEditStatus(card.status || CardStatus.TODO);
      setEditAssignee(card.assignee || '');
    }
  }, [card]); // 当 card 变化时更新

  const statusLabels: Record<CardStatus, string> = {
    [CardStatus.TODO]: '待处理',
    [CardStatus.IN_PROGRESS]: '进行中',
    [CardStatus.DONE]: '已完成',
    [CardStatus.REJECTED]: '已拒绝'
  };

  const handleSave = () => {
    if (editTitle.trim() && card && card._id) {
      const assigneeName = editAssignee ? users.find(user => user._id === editAssignee)?.name || '未分配' : '未分配';
      onSave(card._id, {
        title: editTitle,
        content: editContent,
        status: editStatus,
        assignee: editAssignee || undefined,
        assigneeName: assigneeName
      });
      onClose();
    }
  };

  if (!isOpen || !card) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="编辑卡片" width="500px">
      <div className="form-group">
        <label htmlFor="edit-title">标题</label>
        <input
          type="text"
          id="edit-title"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="modal-input"
          placeholder="Card title"
          autoFocus
        />
      </div>
      <div className="form-group">
        <label htmlFor="edit-content">内容</label>
        <textarea
          id="edit-content"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="modal-textarea"
          placeholder="Card content"
          rows={4}
        />
      </div>
      <div className="form-group">
        <label htmlFor="edit-status">状态</label>
        <select
          id="edit-status"
          value={editStatus}
          onChange={(e) => setEditStatus(e.target.value as CardStatus)}
          className="modal-select"
        >
          {Object.values(CardStatus).map((status) => (
            <option key={status} value={status}>{statusLabels[status]}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="edit-assignee">分配给</label>
        <select
          id="edit-assignee"
          value={editAssignee}
          onChange={(e) => setEditAssignee(e.target.value)}
          className="modal-select"
        >
          <option value="">未分配</option>
          {users.map(user => (
            <option key={user._id} value={user._id}>{user.name}</option>
          ))}
        </select>
      </div>
      <div className="modal-footer">
        <Button variant="secondary" onClick={onClose}>取消</Button>
        <Button variant="success" onClick={handleSave}>保存</Button>
      </div>
    </Modal>
  );
};

export default CardEditModal;
