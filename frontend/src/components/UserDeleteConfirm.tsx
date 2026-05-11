import React from 'react';
import type { User } from '../types';

interface UserDeleteConfirmProps {
  user: User;
  onConfirm: () => void;
  onCancel: () => void;
}

const UserDeleteConfirm: React.FC<UserDeleteConfirmProps> = ({ user, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-modal p-6 w-full max-w-md animate-slide-up">
        <div className="mb-4 pb-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">确认删除</h3>
        </div>
        <div className="mb-4">
          <p className="text-gray-700 text-sm">确定要删除用户 <strong>{user.name}</strong> 吗？</p>
          <p className="text-red-500 text-sm font-medium mt-2">此操作不可恢复。</p>
        </div>
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
          <button 
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            onClick={onCancel}
          >
            取消
          </button>
          <button 
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
            onClick={onConfirm}
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDeleteConfirm;
