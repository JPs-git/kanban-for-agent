import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Plus, Users } from "lucide-react";
import { CardStatus } from "../types";
import type { Card, CardCreate } from "../types";
import { useKanban } from "../hooks/useKanban";
import { useUsers } from "../hooks/useUsers";
import { useToast } from "../context/useToast";
import StatusColumn from "./StatusColumn";
import CardEditModal from "./CardEditModal";
import AddCardModal from "./AddCardModal";
import UserManagement from "./UserManagement";
import Button from "./Button";
import DashboardLayout from "./DashboardLayout";

const KanbanBoard: React.FC = () => {
  const {
    cards,
    loading: cardsLoading,
    addCard,
    updateCard,
    updateCardStatus,
    removeCard,
  } = useKanban();

  const {
    users,
    loading: usersLoading,
    addUser,
    updateUser,
    removeUser,
  } = useUsers();

  const { showSuccess } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editCard, setEditCard] = useState<Partial<Card> | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

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

  const handleCardDrop = async (cardId: string, newStatus: CardStatus) => {
    const result = await updateCardStatus(cardId, newStatus);
    if (result) {
      showSuccess("卡片状态更新成功");
    }
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
    const result = await updateCard(id, updates);
    if (result) {
      showSuccess("卡片更新成功");
    }
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    setEditCard(null);
  };

  const handleAddCard = async (card: CardCreate) => {
    const result = await addCard(card);
    if (result) {
      showSuccess("卡片添加成功");
    }
  };

  const handleAddUser = async (name: string) => {
    const result = await addUser(name);
    if (result) {
      showSuccess("用户添加成功");
    }
  };

  const handleUpdateUser = async (id: string, name: string) => {
    const result = await updateUser(id, name);
    if (result) {
      showSuccess("用户更新成功");
    }
  };

  const handleDeleteUser = async (id: string) => {
    const result = await removeUser(id);
    if (result !== undefined) {
      showSuccess("用户删除成功");
    }
  };

  const loading = cardsLoading || usersLoading;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-gray-500 text-lg">
          Loading...
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
                    removeCard(id).then((result) => {
                      if (result) {
                        showSuccess("卡片删除成功");
                      }
                    });
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
            removeCard(id).then((result) => {
              if (result) {
                showSuccess("卡片删除成功");
              }
            });
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
      </DashboardLayout>
    </DndProvider>
  );
};

export default KanbanBoard;
