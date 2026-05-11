import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Plus, Users } from "lucide-react";
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

  const showToast = (
    message: string,
    type: "success" | "warning" | "error",
    duration: number = 3000,
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
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

  const handleCardUpdate = (
    id: string,
    updates: {
      title?: string;
      content?: string;
      status?: CardStatus;
      assignee?: string;
      assigneeName?: string;
    },
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 py-6 px-4 flex items-center justify-center">
        <div className="max-w-[1400px] w-full bg-white rounded-2xl shadow-xl p-4 md:p-6 h-[calc(100vh-3rem)] flex flex-col">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Kanban Board</h1>
              <p className="text-sm text-gray-500 mt-1">管理您的任务和项目</p>
            </div>
            <div className="flex gap-3">
              <Button variant="success" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Card
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsUserManagementOpen(true)}
              >
                <Users className="w-4 h-4 mr-2" />
                用户管理
              </Button>
            </div>
          </div>

          <div className="flex gap-3 md:gap-4 overflow-x-auto pb-3 flex-1 min-h-0">
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
      </div>
    </DndProvider>
  );
};

export default KanbanBoard;
