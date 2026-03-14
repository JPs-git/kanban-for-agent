import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CardStatus } from "../types";
import type { Card, CardCreate } from "../types";
import { useKanban } from "../hooks/useKanban";
import { useUsers } from "../hooks/useUsers";
import StatusColumn from "./StatusColumn";
import CardEditModal from "./CardEditModal";
import AddCardModal from "./AddCardModal";
import UserManagement from "./UserManagement";
import ToastManager from "./ToastManager";
import Button from "./Button";

const KanbanBoard: React.FC = () => {
  const {
    cards,
    loading: cardsLoading,
    error: cardsError,
    fetchCards,
    addCard,
    updateCardStatus,
    removeCard,
  } = useKanban();

  const {
    users,
    loading: usersLoading,
    error: usersError,
    addUser,
    updateUser,
    removeUser,
  } = useUsers();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editCard, setEditCard] = useState<Partial<Card> | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
  const handleCardEdit = (card: Partial<Card>) => {
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
    import("../services/api").then((api) => {
      api
        .updateCard(id, updates)
        .then(() => {
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
  const handleAddCard = async (card: CardCreate) => {
    try {
      await addCard(card);
      showToast("卡片添加成功", "success");
    } catch (error) {
      console.error("添加卡片失败:", error);
      showToast("添加卡片失败，请稍后重试", "error");
    }
  };

  // 处理添加用户
  const handleAddUser = async (name: string) => {
    try {
      await addUser(name);
      showToast("用户添加成功", "success");
    } catch (error) {
      console.error("添加用户失败:", error);
      showToast("添加用户失败，请稍后重试", "error");
      throw error;
    }
  };

  // 处理更新用户
  const handleUpdateUser = async (id: string, name: string) => {
    try {
      await updateUser(id, name);
      showToast("用户更新成功", "success");
    } catch (error) {
      console.error("更新用户失败:", error);
      showToast("更新用户失败，请稍后重试", "error");
      throw error;
    }
  };

  // 处理删除用户
  const handleDeleteUser = async (id: string) => {
    try {
      await removeUser(id);
      showToast("用户删除成功", "success");
    } catch (error) {
      console.error("删除用户失败:", error);
      showToast("删除用户失败，请稍后重试", "error");
      throw error;
    }
  };

  const loading = cardsLoading || usersLoading;
  const error = cardsError || usersError;

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
            <Button variant="success" onClick={() => setIsAddModalOpen(true)}>
              Add Card
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsUserManagementOpen(true)}
            >
              用户管理
            </Button>
          </div>
        </div>

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
          key={editCard?._id || "null"}
          card={editCard}
          isOpen={isEditModalOpen}
          onClose={handleModalClose}
          onSave={handleCardUpdate}
          users={users}
        />

        <AddCardModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddCard}
          users={users}
        />

        <UserManagement
          isOpen={isUserManagementOpen}
          onClose={() => setIsUserManagementOpen(false)}
          users={users}
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          loading={usersLoading}
        />

        <ToastManager toasts={toasts} onClose={closeToast} />
      </div>
    </DndProvider>
  );
};

export default KanbanBoard;
