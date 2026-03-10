import React, { useState, useEffect } from 'react';
import type { Card } from '../types';
import { CardStatus } from '../types';

interface CardEditModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: { title?: string; content?: string; status?: CardStatus; assignee?: string; assigneeName?: string }) => void;
}

// 模拟用户数据
const mockUsers = [
  { id: '1', name: '张三' },
  { id: '2', name: '李四' },
  { id: '3', name: '王五' },
  { id: '4', name: '赵六' }
];

const CardEditModal: React.FC<CardEditModalProps> = ({ card, isOpen, onClose, onSave }) => {
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editStatus, setEditStatus] = useState<CardStatus>(CardStatus.TODO);
  const [editAssignee, setEditAssignee] = useState('');

  useEffect(() => {
    if (card) {
      setEditTitle(card.title);
      setEditContent(card.content || '');
      setEditStatus(card.status);
      setEditAssignee(card.assignee || '');
    }
  }, [card]);

  const statusLabels: Record<CardStatus, string> = {
    [CardStatus.TODO]: '待处理',
    [CardStatus.IN_PROGRESS]: '进行中',
    [CardStatus.DONE]: '已完成',
    [CardStatus.REJECTED]: '已拒绝'
  };

  const handleSave = () => {
    if (editTitle.trim() && card) {
      const assigneeName = editAssignee ? mockUsers.find(user => user.id === editAssignee)?.name || '未分配' : '未分配';
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
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>编辑卡片</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
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
              {mockUsers.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-cancel" onClick={onClose}>取消</button>
          <button className="modal-save" onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  );
};

export default CardEditModal;