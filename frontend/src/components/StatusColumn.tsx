import React from "react";
import { useDrop } from "react-dnd";
import type { Card as CardType } from "../types";
import { CardStatus } from "../types";
import Card from "./Card";

interface StatusColumnProps {
  status: CardStatus;
  cards: Partial<CardType>[];
  onCardDrop: (cardId: string, newStatus: CardStatus) => void;
  onDeleteCard: (cardId: string) => void;
  onEditCard: (card: Partial<CardType>) => void;
}

const StatusColumn: React.FC<StatusColumnProps> = ({
  status,
  cards,
  onCardDrop,
  onDeleteCard,
  onEditCard,
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: "CARD",
    drop: (item: { id: string }) => {
      if (item.id) {
        onCardDrop(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const statusLabels: Record<CardStatus, string> = {
    [CardStatus.TODO]: "待处理",
    [CardStatus.IN_PROGRESS]: "进行中",
    [CardStatus.DONE]: "已完成",
    [CardStatus.REJECTED]: "已拒绝",
  };

  const statusColors: Record<CardStatus, string> = {
    [CardStatus.TODO]: "bg-blue-500",
    [CardStatus.IN_PROGRESS]: "bg-amber-500",
    [CardStatus.DONE]: "bg-green-500",
    [CardStatus.REJECTED]: "bg-red-500",
  };

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      data-testid="status-column"
      className={`flex flex-col bg-gray-50 rounded-xl p-3 border border-gray-200 transition-all duration-200 w-full flex-1 min-w-[240px] max-w-[320px] ${
        isOver ? "bg-blue-50 border-blue-300 ring-2 ring-blue-200" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${statusColors[status]}`}></div>
          <h2 className="font-semibold text-gray-700 text-base">
            {statusLabels[status]}
          </h2>
        </div>
        <span className="bg-gray-200 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
          {cards.length}
        </span>
      </div>
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto min-h-0">
        {cards.map((card) => (
          <Card
            key={card._id}
            card={card}
            onDelete={onDeleteCard}
            onEdit={onEditCard}
          />
        ))}
      </div>
    </div>
  );
};

export default StatusColumn;
