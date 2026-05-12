export const CardStatus = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
  REJECTED: "REJECTED",
} as const;

export type CardStatus = (typeof CardStatus)[keyof typeof CardStatus];

export interface Card {
  id: string;
  title: string;
  content: string;
  status: CardStatus;
  createdAt: string;
  updatedAt: string;
  assignee?: string;
  assigneeName?: string;
}

export interface CardCreate {
  title: string;
  content: string;
  status?: CardStatus;
  assignee?: string;
  assigneeName?: string;
}

export interface CardUpdate {
  title?: string;
  content?: string;
  status?: CardStatus;
  assignee?: string;
  assigneeName?: string;
}

export interface User {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}
