import React, { useState } from "react";
import UserForm from "./UserForm";
import UserDeleteConfirm from "./UserDeleteConfirm";
import Button from "./Button";
import Modal from "./Modal";
import type { User } from "../types";

interface UserManagementProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onAddUser: (name: string) => Promise<void>;
  onUpdateUser: (id: string, name: string) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  loading?: boolean;
}

const UserManagement: React.FC<UserManagementProps> = ({
  isOpen,
  onClose,
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"id" | "name">("id");
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // 过滤和排序用户列表
  const filteredAndSortedUsers = users
    .filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "id") {
        return a._id.localeCompare(b._id);
      } else {
        return a.name.localeCompare(b.name);
      }
    });

  // 处理添加用户
  const handleAddUser = async (name: string) => {
    await onAddUser(name);
    setIsAddFormOpen(false);
  };

  // 处理编辑用户
  const handleEditUser = async (id: string, name: string) => {
    await onUpdateUser(id, name);
    setEditingUser(null);
  };

  // 处理删除用户
  const handleDeleteUser = async (userId: string) => {
    await onDeleteUser(userId);
    setUserToDelete(null);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="用户管理" width="400px">
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
          onChange={(e) => setSortBy(e.target.value as "id" | "name")}
          className="sort-select"
        >
          <option value="id">按ID排序</option>
          <option value="name">按名称排序</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="user-list">
          {filteredAndSortedUsers.length === 0 ? (
            <div className="empty-state">暂无用户</div>
          ) : (
            filteredAndSortedUsers.map((user) => (
              <div key={user._id} className="user-item">
                <div className="user-info">
                  <span className="user-id">ID: {user._id}</span>
                  <span className="user-name">{user.name}</span>
                </div>
                <div className="user-actions">
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => setEditingUser(user)}
                  >
                    编辑
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => setUserToDelete(user)}
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Button variant="success" onClick={() => setIsAddFormOpen(true)}>
        添加用户
      </Button>

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
          onSave={(name) => handleEditUser(editingUser._id, name)}
          onCancel={() => setEditingUser(null)}
          user={editingUser}
        />
      )}

      {/* 删除用户确认 */}
      {userToDelete && (
        <UserDeleteConfirm
          user={userToDelete}
          onConfirm={() => handleDeleteUser(userToDelete._id)}
          onCancel={() => setUserToDelete(null)}
        />
      )}
    </Modal>
  );
};

export default UserManagement;
