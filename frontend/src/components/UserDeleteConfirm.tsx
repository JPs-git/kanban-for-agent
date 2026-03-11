import React from 'react';

interface User {
  id: string;
  name: string;
}

interface UserDeleteConfirmProps {
  user: User;
  onConfirm: () => void;
  onCancel: () => void;
}

const UserDeleteConfirm: React.FC<UserDeleteConfirmProps> = ({ user, onConfirm, onCancel }) => {
  return (
    <div className="delete-confirm-overlay">
      <div className="delete-confirm">
        <div className="delete-confirm-header">
          <h3>确认删除</h3>
        </div>
        <div className="delete-confirm-body">
          <p>确定要删除用户 <strong>{user.name}</strong> 吗？</p>
          <p className="delete-warning">此操作不可恢复。</p>
        </div>
        <div className="delete-confirm-actions">
          <button className="cancel-button" onClick={onCancel}>
            取消
          </button>
          <button className="delete-confirm-button" onClick={onConfirm}>
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDeleteConfirm;