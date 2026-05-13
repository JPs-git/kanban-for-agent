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
  const [sortBy, setSortBy] = useState<"id" | "name">("name");
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const filteredAndSortedUsers = users
    .filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "id") {
        return a.id.localeCompare(b.id);
      } else {
        return a.name.localeCompare(b.name);
      }
    });

  const handleAddUser = async (name: string) => {
    await onAddUser(name);
    setIsAddFormOpen(false);
  };

  const handleEditUser = async (id: string, name: string) => {
    await onUpdateUser(id, name);
    setEditingUser(null);
  };

  const handleDeleteUser = async (userId: string) => {
    await onDeleteUser(userId);
    setUserToDelete(null);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="用户管理" width="400px">
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="搜索用户..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "id" | "name")}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="name">按名称排序</option>
          <option value="id">按ID排序</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">加载中...</div>
      ) : (
        <div className="max-h-64 overflow-y-auto mb-4">
          {filteredAndSortedUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              暂无用户
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAndSortedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {user.name}
                    </span>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
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
              ))}
            </div>
          )}
        </div>
      )}

      <Button
        variant="success"
        onClick={() => setIsAddFormOpen(true)}
        className="w-full"
      >
        添加用户
      </Button>

      {isAddFormOpen && (
        <UserForm
          onSave={handleAddUser}
          onCancel={() => setIsAddFormOpen(false)}
          user={null}
        />
      )}

      {editingUser && (
        <UserForm
          onSave={(name) => handleEditUser(editingUser.id, name)}
          onCancel={() => setEditingUser(null)}
          user={editingUser}
        />
      )}

      {userToDelete && (
        <UserDeleteConfirm
          user={userToDelete}
          onConfirm={() => handleDeleteUser(userToDelete.id)}
          onCancel={() => setUserToDelete(null)}
        />
      )}
    </Modal>
  );
};

export default UserManagement;
