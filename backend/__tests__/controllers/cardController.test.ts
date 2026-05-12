import { jest, describe, test, expect } from "@jest/globals";
import request from "supertest";
import { CardStatus } from "../../src/models/Card";
import { app } from "../../src/server";

jest.mock("../../src/models/Card", () => {
  interface MockCard {
    id: number;
    title: string;
    content: string;
    status: string;
    assignee?: string;
    assigneeName?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }

  const mockCards: MockCard[] = [];
  let nextId = 1;

  const mockCardModule = {
    CardStatus: {
      TODO: "TODO",
      IN_PROGRESS: "IN_PROGRESS",
      DONE: "DONE",
      REJECTED: "REJECTED",
    },
    Card: {
      find: jest.fn().mockImplementation(() => mockCards),
      findById: jest.fn().mockImplementation((id: number) => {
        const card = mockCards.find((c) => c.id === id);
        return card || undefined;
      }),
      create: jest
        .fn()
        .mockImplementation(
          (cardData: {
            title: string;
            content?: string;
            status?: string;
            assignee?: string;
            assigneeName?: string;
          }) => {
            const newCard: MockCard = {
              id: nextId++,
              title: cardData.title,
              content: cardData.content || "",
              status: cardData.status || "TODO",
              assignee: cardData.assignee,
              assigneeName: cardData.assigneeName,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            mockCards.push(newCard);
            return newCard;
          },
        ),
      findByIdAndUpdate: jest.fn().mockImplementation(
        (
          id: number,
          update: {
            title?: string;
            content?: string;
            status?: string;
            assignee?: string;
            assigneeName?: string;
          },
        ) => {
          const index = mockCards.findIndex((c) => c.id === id);
          if (index === -1) {
            return undefined;
          }
          const updatedCard = {
            ...mockCards[index],
            ...update,
            updatedAt: new Date(),
          };
          mockCards[index] = updatedCard;
          return updatedCard;
        },
      ),
      findByIdAndDelete: jest.fn().mockImplementation((id: number) => {
        const index = mockCards.findIndex((c) => c.id === id);
        if (index === -1) {
          return undefined;
        }
        const deletedCard = mockCards[index];
        mockCards.splice(index, 1);
        return deletedCard;
      }),
    },
  };

  return mockCardModule;
});

jest.mock("../../src/config/db", () => {
  return {
    connectDB: jest.fn().mockImplementation(() => {}),
  };
});

describe("Card Controller", () => {
  test("GET /api/cards should return all cards", async () => {
    const response = await request(app).get("/api/cards");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("POST /api/cards should create a new card", async () => {
    const cardData = {
      title: "New Card",
      content: "New content",
      status: CardStatus.IN_PROGRESS,
    };

    const response = await request(app).post("/api/cards").send(cardData);

    expect(response.status).toBe(201);
    expect(response.body.title).toBe("New Card");
    expect(response.body.content).toBe("New content");
    expect(response.body.status).toBe(CardStatus.IN_PROGRESS);
  });

  test("POST /api/cards should return 400 if title is missing", async () => {
    const cardData = {
      content: "Content without title",
    };

    const response = await request(app).post("/api/cards").send(cardData);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Title is required");
  });

  test("PUT /api/cards/:id should update a card", async () => {
    const cardData = {
      title: "Test Card",
      content: "Test content",
      status: CardStatus.TODO,
    };

    const createResponse = await request(app).post("/api/cards").send(cardData);
    const cardId = createResponse.body.id;

    const updateData = {
      title: "Updated Title",
      content: "Updated content",
      status: CardStatus.DONE,
    };

    const response = await request(app)
      .put(`/api/cards/${cardId}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Updated Title");
    expect(response.body.content).toBe("Updated content");
    expect(response.body.status).toBe(CardStatus.DONE);
  });

  test("PUT /api/cards/:id should return 404 if card not found", async () => {
    const updateData = {
      title: "Updated Title",
    };

    const response = await request(app)
      .put("/api/cards/999999")
      .send(updateData);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Card not found");
  });

  test("DELETE /api/cards/:id should return 404 if card not found", async () => {
    const response = await request(app).delete("/api/cards/999999");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Card not found");
  });
});
