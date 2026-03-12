import React, { useState } from 'react';
import { CardStatus } from '../types';
import type { CardCreate, User } from '../types';
import Modal from './Modal';
import Button from './Button';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (card: CardCreate) => void;
  users: User[];
}

const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, onClose, onAdd, users }) => {
  const [newCard, setNewCard] = useState<CardCreate>({
    title: '',
    content: '',
    status: CardStatus.TODO,
    assignee: '',
    assigneeName: '未分配',
  });

  const handleSubmit = () => {
    if (newCard.title) {
      const assigneeName = newCard.assignee
        ? users.find((user) => user._id === newCard.assignee)?.name || '未分配'
        : '未分配';
      onAdd({
        ...newCard,
        assigneeName: assigneeName,
      });
      onClose();
    }
  };

  const statusLabels: Record<CardStatus, string> = {
    [CardStatus.TODO]: '待处理',
    [CardStatus.IN_PROGRESS]: '进行中',
    [CardStatus.DONE]: '已完成',
    [CardStatus.REJECTED]: '已拒绝',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="添加卡片" width="500px">
      <div className="form-group">
        <label htmlFor="add-title">标题</label>
        <input
          type="text"
          id="add-title"
          value={newCard.title}
          onChange={(e) =>
            setNewCard({ ...newCard, title: e.target.value })
          }
          className="modal-input"
          placeholder="Card title"
          autoFocus
        />
      </div>
      <div className="form-group">
        <label htmlFor="add-content">内容</label>
        <textarea
          id="add-content"
          value={newCard.content}
          onChange={(e) =>
            setNewCard({ ...newCard, content: e.target.value })
          }
          className="modal-textarea"
          placeholder="Card content"
          rows={4}
        />
      </div>
      <div className="form-group">
        <label htmlFor="add-status">状态</label>
        <select
          id="add-status"
          value={newCard.status}
          onChange={(e) =>
            setNewCard({ ...newCard, status: e.target.value as CardStatus })
          }
          className="modal-select"
        >
          {Object.values(CardStatus).map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="add-assignee">分配给</label>
        <select
          id="add-assignee"
          value={newCard.assignee}
          onChange={(e) =>
            setNewCard({ ...newCard, assignee: e.target.value })
          }
          className="modal-select"
        >
          <option value="">未分配</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
      <div className="modal-footer">
        <Button variant="secondary" onClick={onClose}>取消</Button>
        <Button variant="success" onClick={handleSubmit}>保存</Button>
      </div>
    </Modal>
  );
};

export default AddCardModal;
