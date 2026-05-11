import React from "react";
import { useDrag } from "react-dnd";
import { Trash2 } from "lucide-react";
import type { Card as CardType } from "../types";
import { CardStatus } from "../types";

interface CardProps {
  card: Partial<CardType>;
  onDelete: (id: string) => void;
  onEdit: (card: Partial<CardType>) => void;
}

const Card: React.FC<CardProps> = ({ card, onDelete, onEdit }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "CARD",
    item: { id: card._id, status: card.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
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

  const getAssigneeDisplayName = () => {
    return card.assigneeName || "未分配";
  };

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      data-testid="card"
      className={`bg-white rounded-xl p-4 shadow-card hover:shadow-cardHover transition-all duration-200 cursor-pointer group ${
        isDragging ? "opacity-50 scale-105" : "hover:-translate-y-1"
      }`}
      onClick={() => !isDragging && onEdit(card)}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight flex-1 pr-2">
          {card.title}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (card._id) {
              onDelete(card._id);
            }
          }}
          aria-label="Delete card"
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="mb-3">
        <p className="text-gray-600 text-sm leading-relaxed">{card.content}</p>
      </div>
      <div className="flex items-center mb-3 text-xs">
        <span className="text-gray-500 mr-2">分配给：</span>
        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
          {getAssigneeDisplayName()}
        </span>
      </div>
      <div className="flex justify-end">
        <span
          className={`${statusColors[card.status as CardStatus]} text-white text-xs px-3 py-1 rounded-full font-medium`}
        >
          {statusLabels[card.status as CardStatus]}
        </span>
      </div>
    </div>
  );
};

export default Card;
