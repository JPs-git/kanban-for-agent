import React, { useState } from 'react';
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

const CardEditModalContent: React.FC<CardEditModalProps> = ({ card, isOpen, onClose, onSave, users }) => {
  const [editTitle, setEditTitle] = useState(card?.title || '');
  const [editContent, setEditContent] = useState(card?.content || '');
  const [editStatus, setEditStatus] = useState<CardStatus>(card?.status || CardStatus.TODO);
  const [editAssignee, setEditAssignee] = useState(card?.assignee || '');

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
      <div className="space-y-4">
        <div>
          <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">标题</label>
          <input
            type="text"
            id="edit-title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Card title"
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="edit-content" className="block text-sm font-medium text-gray-700 mb-1">内容</label>
          <textarea
            id="edit-content"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="Card content"
            rows={4}
          />
        </div>
        <div>
          <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <select
            id="edit-status"
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value as CardStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {Object.values(CardStatus).map((status) => (
              <option key={status} value={status}>{statusLabels[status]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="edit-assignee" className="block text-sm font-medium text-gray-700 mb-1">分配给</label>
          <select
            id="edit-assignee"
            value={editAssignee}
            onChange={(e) => setEditAssignee(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">未分配</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>{user.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
        <Button variant="secondary" onClick={onClose}>取消</Button>
        <Button variant="success" onClick={handleSave}>保存</Button>
      </div>
    </Modal>
  );
};

const CardEditModal: React.FC<CardEditModalProps> = ({ card, ...props }) => {
  return <CardEditModalContent key={card?._id} card={card} {...props} />;
};

export default CardEditModal;
