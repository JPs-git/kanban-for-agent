import mongoose from 'mongoose';

export enum CardStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  REJECTED = 'REJECTED'
}

interface Card {
  title: string;
  content: string;
  status: CardStatus;
  createdAt: Date;
  updatedAt: Date;
}

const cardSchema = new mongoose.Schema<Card>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(CardStatus),
      default: CardStatus.TODO
    }
  },
  {
    timestamps: true
  }
);

export const Card = mongoose.model<Card>('Card', cardSchema);