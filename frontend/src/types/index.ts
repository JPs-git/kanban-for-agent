export const CardStatus = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  REJECTED: 'REJECTED'
} as const;

export type CardStatus = typeof CardStatus[keyof typeof CardStatus];

export interface Card {
  _id: string;
  title: string;
  content: string;
  status: CardStatus;
  createdAt: string;
  updatedAt: string;
  __v: number;
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