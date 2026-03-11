import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CardStatus } from "../types";
import type { Card, CardCreate } from "../types";
import { useKanban } from "../hooks/useKanban";
import StatusColumn from "./StatusColumn";
import CardEditModal from "./CardEditModal";
import UserManagement from "./UserManagement";
import ToastManager from "./ToastManager";

// 模拟用户数据
const mockUsers = [
  { id: "1", name: "张三" },
  { id: "2", name: "李四" },
  { id: "3", name: "王五" },
  { id: "4", name: "赵六" },
];

interface User {
  id: string;
  name: string;
}

const KanbanBoard: React.FC = () => {
  const {
    cards,
    loading,
    error,
    addCard,
    updateCardStatus,
    removeCard,
    fetchCards,
  } = useKanban();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState<CardCreate>({
    title: "",
    content: "",
    status: CardStatus.TODO,
    assignee: "",
    assigneeName: "未分配",
  });
  const [editCard, setEditCard] = useState<Card | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [toasts, setToasts] = useState<
    Array<{
      id: string;
      message: string;
      type: "success" | "warning" | "error";
      duration?: number;
    }>
  >([]);

  // 显示Toast消息
  const showToast = (
    message: string,
    type: "success" | "warning" | "error",
    duration: number = 3000
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  // 关闭Toast消息
  const closeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // 按状态分组卡片
  const groupedCards = cards.reduce((acc, card) => {
    if (!acc[card.status]) {
      acc[card.status] = [];
    }
    acc[card.status].push(card);
    return acc;
  }, {} as Record<CardStatus, Card[]>);

  // 处理卡片拖放
  const handleCardDrop = (cardId: string, newStatus: CardStatus) => {
    updateCardStatus(cardId, newStatus);
  };

  // 处理卡片编辑
  const handleCardEdit = (card: Card) => {
    setEditCard(card);
    setIsEditModalOpen(true);
  };

  // 处理卡片更新
  const handleCardUpdate = (
    id: string,
    updates: {
      title?: string;
      content?: string;
      status?: CardStatus;
      assignee?: string;
      assigneeName?: string;
    }
  ) => {
    // 这里可以添加更新卡片的逻辑
    // 目前updateCardStatus只更新状态，我们需要添加一个新的API调用或修改现有函数
    // 为了简化，我们可以直接调用API的updateCard函数
    import("../services/api").then((api) => {
      api
        .updateCard(id, updates)
        .then((updatedCard) => {
          // 刷新卡片列表
          fetchCards();
          showToast("卡片更新成功", "success");
        })
        .catch((error) => {
          console.error("Failed to update card:", error);
          showToast("卡片更新失败，请稍后重试", "error");
        });
    });
  };

  // 处理模态框关闭
  const handleModalClose = () => {
    setIsEditModalOpen(false);
    setEditCard(null);
  };

  // 处理添加卡片
  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCard.title) {
      try {
        const assigneeName = newCard.assignee
          ? users.find((user) => user.id === newCard.assignee)?.name || "未分配"
          : "未分配";
        await addCard({
          ...newCard,
          assigneeName: assigneeName,
        });
        setNewCard({
          title: "",
          content: "",
          status: CardStatus.TODO,
          assignee: "",
          assigneeName: "未分配",
        });
        setShowAddForm(false);
        showToast("卡片添加成功", "success");
      } catch (error) {
        console.error("添加卡片失败:", error);
        showToast("添加卡片失败，请稍后重试", "error");
      }
    } else {
      showToast("请输入卡片标题", "warning");
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="kanban-board">
        <div className="board-header">
          <h1>Kanban Board</h1>
          <div className="header-buttons">
            <button
              className="add-button"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? "Cancel" : "Add Card"}
            </button>
            <button
              className="user-management-button"
              onClick={() => setIsUserManagementOpen(true)}
            >
              用户管理
            </button>
          </div>
        </div>

        {showAddForm && (
          <form className="add-card-form" onSubmit={handleAddCard}>
            <input
              type="text"
              placeholder="Card title"
              value={newCard.title}
              onChange={(e) =>
                setNewCard({ ...newCard, title: e.target.value })
              }
              required
            />
            <textarea
              placeholder="Card content"
              value={newCard.content}
              onChange={(e) =>
                setNewCard({ ...newCard, content: e.target.value })
              }
            />
            <select
              value={newCard.status}
              onChange={(e) =>
                setNewCard({ ...newCard, status: e.target.value as CardStatus })
              }
            >
              {Object.values(CardStatus).map((status) => {
                const statusLabels: Record<CardStatus, string> = {
                  [CardStatus.TODO]: "待处理",
                  [CardStatus.IN_PROGRESS]: "进行中",
                  [CardStatus.DONE]: "已完成",
                  [CardStatus.REJECTED]: "已拒绝",
                };
                return (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                );
              })}
            </select>
            <select
              value={newCard.assignee}
              onChange={(e) =>
                setNewCard({ ...newCard, assignee: e.target.value })
              }
            >
              <option value="">未分配</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            <button type="submit">Create Card</button>
          </form>
        )}

        <div className="board-content">
          {Object.values(CardStatus).map((status) => (
            <StatusColumn
              key={status}
              status={status}
              cards={groupedCards[status] || []}
              onCardDrop={handleCardDrop}
              onDeleteCard={removeCard}
              onEditCard={handleCardEdit}
            />
          ))}
        </div>

        <CardEditModal
          card={editCard}
          isOpen={isEditModalOpen}
          onClose={handleModalClose}
          onSave={handleCardUpdate}
          users={users}
        />

        <UserManagement
          isOpen={isUserManagementOpen}
          onClose={() => setIsUserManagementOpen(false)}
          users={users}
          onUsersChange={setUsers}
        />

        <ToastManager toasts={toasts} onClose={closeToast} />
      </div>
    </DndProvider>
  );
};

export default KanbanBoard;
