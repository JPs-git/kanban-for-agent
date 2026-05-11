import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { User } from '../types';

interface UserFormProps {
  user: User | null;
  onSave: (name: string) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel }) => {
  const [name, setName] = useState(() => user?.name || '');
  const [errors, setErrors] = useState<{ name?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = '用户名不能为空';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-modal p-6 w-full max-w-md animate-slide-up">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{user ? '编辑用户' : '添加用户'}</h3>
          <button 
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onCancel}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入用户名"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && <span className="text-red-500 text-xs mt-1 block">{errors.name}</span>}
          </div>
          
          <div className="flex justify-end gap-3">
            <button 
              type="button" 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              onClick={onCancel}
            >
              取消
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
            >
              {user ? '保存' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
