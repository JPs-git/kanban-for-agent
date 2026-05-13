import React, { useState } from "react";
import { CardStatus } from "../types";
import type { CardCreate, User } from "../types";
import Modal from "./Modal";
import Button from "./Button";

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (card: CardCreate) => void;
  users: User[];
}

const AddCardModal: React.FC<AddCardModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  users,
}) => {
  const [newCard, setNewCard] = useState<CardCreate>({
    title: "",
    content: "",
    status: CardStatus.TODO,
    assignee: "",
    assigneeName: "未分配",
  });

  const handleClose = () => {
    setNewCard({
      title: "",
      content: "",
      status: CardStatus.TODO,
      assignee: "",
      assigneeName: "未分配",
    });
    onClose();
  };

  const handleSubmit = () => {
    if (newCard.title) {
      const assigneeName = newCard.assignee
        ? users.find((user) => user.id === newCard.assignee)?.name || "未分配"
        : "未分配";
      onAdd({
        ...newCard,
        assigneeName: assigneeName,
      });
      handleClose();
    }
  };

  const statusLabels: Record<CardStatus, string> = {
    [CardStatus.TODO]: "待处理",
    [CardStatus.IN_PROGRESS]: "进行中",
    [CardStatus.DONE]: "已完成",
    [CardStatus.REJECTED]: "已拒绝",
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="添加卡片" width="500px">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="add-title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            标题
          </label>
          <input
            type="text"
            id="add-title"
            value={newCard.title}
            onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Card title"
            autoFocus
          />
        </div>
        <div>
          <label
            htmlFor="add-content"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            内容
          </label>
          <textarea
            id="add-content"
            value={newCard.content}
            onChange={(e) =>
              setNewCard({ ...newCard, content: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="Card content"
            rows={4}
          />
        </div>
        <div>
          <label
            htmlFor="add-status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            状态
          </label>
          <select
            id="add-status"
            value={newCard.status}
            onChange={(e) =>
              setNewCard({ ...newCard, status: e.target.value as CardStatus })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {Object.values(CardStatus).map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="add-assignee"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            分配给
          </label>
          <select
            id="add-assignee"
            value={newCard.assignee}
            onChange={(e) =>
              setNewCard({ ...newCard, assignee: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">未分配</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
        <Button variant="secondary" onClick={handleClose}>
          取消
        </Button>
        <Button variant="success" onClick={handleSubmit}>
          保存
        </Button>
      </div>
    </Modal>
  );
};

export default AddCardModal;
