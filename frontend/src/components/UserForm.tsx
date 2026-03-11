import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
}

interface UserFormProps {
  user: User | null;
  onSave: (user: User) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel }) => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{ id?: string; name?: string }>({});

  // 当user变化时，更新表单数据
  useEffect(() => {
    if (user) {
      setId(user.id);
      setName(user.name);
    } else {
      setId('');
      setName('');
    }
    setErrors({});
  }, [user]);

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
      onSave({ id, name });
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
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
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