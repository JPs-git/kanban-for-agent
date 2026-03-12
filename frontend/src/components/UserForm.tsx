import React, { useState } from 'react';
import type { User } from '../types';

interface UserFormProps {
  user: User | null;
  onSave: (name: string) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel }) => {
  const [name, setName] = useState(() => user?.name || '');
  const [errors, setErrors] = useState<{ name?: string }>({});

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = '用户名不能为空';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(name.trim());
    }
  };

  return (
    <div className="user-form-overlay">
      <div className="user-form">
        <div className="user-form-header">
          <h3>{user ? '编辑用户' : '添加用户'}</h3>
          <button className="close-button" onClick={onCancel}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">用户名</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入用户名"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onCancel}>
              取消
            </button>
            <button type="submit" className="save-button">
              {user ? '保存' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
