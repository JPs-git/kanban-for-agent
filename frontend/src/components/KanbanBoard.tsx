import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Plus, Users } from "lucide-react";
import { CardStatus } from "../types";
import type { Card, CardCreate } from "../types";
import { useKanban } from "../hooks/useKanban";
import { useUsers } from "../hooks/useUsers";
import * as api from "../services/api";
import StatusColumn from "./StatusColumn";
import CardEditModal from "./CardEditModal";
import AddCardModal from "./AddCardModal";
import UserManagement from "./UserManagement";
import ToastManager from "./ToastManager";
import Button from "./Button";
import DashboardLayout from "./DashboardLayout";

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

  const showToast = (
    message: string,
    type: "success" | "warning" | "error",
    duration: number = 3000,
  ) => {
    setToasts((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        message,
        type,
        duration,
      },
    ]);
  };

  const closeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const groupedCards = cards.reduce(
    (acc, card) => {
      if (!acc[card.status]) {
        acc[card.status] = [];
      }
      acc[card.status].push(card);
      return acc;
    },
    {} as Record<CardStatus, Card[]>,
  );

  const handleCardDrop = (cardId: string, newStatus: CardStatus) => {
    updateCardStatus(cardId, newStatus);
  };

  const handleCardEdit = (card: Partial<Card>) => {
    setEditCard(card);
    setIsEditModalOpen(true);
  };

  const handleCardUpdate = async (
    id: string,
    updates: {
      title?: string;
      content?: string;
      status?: CardStatus;
      assignee?: string;
      assigneeName?: string;
    },
  ) => {
    try {
      await api.updateCard(id, updates);
      fetchCards();
      showToast("卡片更新成功", "success");
    } catch (error) {
      console.error("Failed to update card:", error);
      showToast("卡片更新失败，请稍后重试", "error");
    }
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    setEditCard(null);
  };

  const handleAddCard = async (card: CardCreate) => {
    try {
      await addCard(card);
      showToast("卡片添加成功", "success");
    } catch (error) {
      console.error("添加卡片失败:", error);
      showToast("添加卡片失败，请稍后重试", "error");
    }
  };

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
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-gray-500 text-lg">
          Loading...
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-red-500 text-lg">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  const actions = (
    <>
      <Button variant="success" onClick={() => setIsAddModalOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Add Card
      </Button>
      <Button variant="primary" onClick={() => setIsUserManagementOpen(true)}>
        <Users className="w-4 h-4 mr-2" />
        用户管理
      </Button>
    </>
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <DashboardLayout actions={actions}>
        <div className="max-w-[1400px] w-full mx-auto h-full">
          <div className="h-full bg-white rounded-2xl shadow-xl p-4 md:p-6">
            <div className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {Object.values(CardStatus).map((status) => (
                <StatusColumn
                  key={status}
                  status={status}
                  cards={groupedCards[status] || []}
                  onCardDrop={handleCardDrop}
                  onDeleteCard={(id) => {
                    removeCard(id)
                      .then(() => showToast("卡片删除成功", "success"))
                      .catch(() => showToast("卡片删除失败", "error"));
                  }}
                  onEditCard={handleCardEdit}
                />
              ))}
            </div>
          </div>
        </div>

        <CardEditModal
          key={editCard?.id || "null"}
          card={editCard}
          isOpen={isEditModalOpen}
          onClose={handleModalClose}
          onSave={handleCardUpdate}
          onDelete={(id) => {
            removeCard(id)
              .then(() => showToast("卡片删除成功", "success"))
              .catch(() => showToast("卡片删除失败", "error"));
          }}
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
      </DashboardLayout>
    </DndProvider>
  );
};

export default KanbanBoard;
