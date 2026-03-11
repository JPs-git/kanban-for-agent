import React, { useState, useEffect } from 'react';
import UserForm from './UserForm';
import UserDeleteConfirm from './UserDeleteConfirm';

interface User {
  id: string;
  name: string;
}

interface UserManagementProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onUsersChange: (users: User[]) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({
  isOpen,
  onClose,
  users,
  onUsersChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'name'>('id');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // 过滤和排序用户列表
  const filteredAndSortedUsers = users
    .filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'id') {
        return a.id.localeCompare(b.id);
      } else {
        return a.name.localeCompare(b.name);
      }
    });

  // 处理添加用户
  const handleAddUser = (user: User) => {
    // 自动生成唯一id
    const newUser = {
      ...user,
      id: Math.random().toString(36).substring(2, 9)
    };
    onUsersChange([...users, newUser]);
    setIsAddFormOpen(false);
  };

  // 处理编辑用户
  const handleEditUser = (updatedUser: User) => {
    onUsersChange(users.map(user => user.id === updatedUser.id ? updatedUser : user));
    setEditingUser(null);
  };

  // 处理删除用户
  const handleDeleteUser = (userId: string) => {
    onUsersChange(users.filter(user => user.id !== userId));
    setUserToDelete(null);
  };

  if (!isOpen) return null;

  return (
    <div className="user-management-overlay">
      <div className="user-management-panel">
        <div className="user-management-header">
          <h2>用户管理</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="user-management-search">
          <input
            type="text"
            placeholder="搜索用户..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'id' | 'name')}
            className="sort-select"
          >
            <option value="id">按ID排序</option>
            <option value="name">按名称排序</option>
          </select>
        </div>

        <div className="user-list">
          {filteredAndSortedUsers.length === 0 ? (
            <div className="empty-state">暂无用户</div>
          ) : (
            filteredAndSortedUsers.map(user => (
              <div key={user.id} className="user-item">
                <div className="user-info">
                  <span className="user-id">ID: {user.id}</span>
                  <span className="user-name">{user.name}</span>
                </div>
                <div className="user-actions">
                  <button
                    className="edit-button"
                    onClick={() => setEditingUser(user)}
                  >
                    编辑
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => setUserToDelete(user)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          className="add-user-button"
          onClick={() => setIsAddFormOpen(true)}
        >
          添加用户
        </button>

        {/* 添加用户表单 */}
        {isAddFormOpen && (
          <UserForm
            onSave={handleAddUser}
            onCancel={() => setIsAddFormOpen(false)}
            user={null}
          />
        )}

        {/* 编辑用户表单 */}
        {editingUser && (
          <UserForm
            onSave={handleEditUser}
            onCancel={() => setEditingUser(null)}
            user={editingUser}
          />
        )}

        {/* 删除用户确认 */}
        {userToDelete && (
          <UserDeleteConfirm
            user={userToDelete}
            onConfirm={() => handleDeleteUser(userToDelete.id)}
            onCancel={() => setUserToDelete(null)}
          />
        )}
      </div>
    </div>
  );
};

export default UserManagement;