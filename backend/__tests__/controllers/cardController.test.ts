import { jest, describe, test, expect } from "@jest/globals";
import request from "supertest";

jest.mock("../../src/config/db", () => {
  return {
    connectDB: jest.fn().mockImplementation(() => {}),
  };
});

jest.mock("../../src/models/Card", () => {
  interface MockCard {
    id: string;
    title: string;
    content: string;
    status: string;
    assignee?: string;
    assigneeName?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }

  const mockCards: MockCard[] = [];

  const generateUUID = () => {
    return `${Math.random().toString(16).substr(2, 8)}-${Math.random().toString(16).substr(2, 4)}-${Math.random().toString(16).substr(2, 4)}-${Math.random().toString(16).substr(2, 4)}-${Math.random().toString(16).substr(2, 12)}`;
  };

  const mockCardModule = {
    CardStatus: {
      TODO: "TODO",
      IN_PROGRESS: "IN_PROGRESS",
      DONE: "DONE",
      REJECTED: "REJECTED",
    },
    Card: {
      find: jest.fn().mockImplementation(() => mockCards),
      findById: jest.fn().mockImplementation((id: string) => {
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
              id: generateUUID(),
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
          id: string,
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
      findByIdAndDelete: jest.fn().mockImplementation((id: string) => {
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

import { app } from "../../src/server";
import { CardStatus } from "../../src/models/Card";

describe("Card Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/cards should return all cards", async () => {
    const response = await request(app).get("/api/cards");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("GET /api/cards/:id should return a single card", async () => {
    const createResponse = await request(app).post("/api/cards").send({
      title: "Test Card",
      content: "Test content",
      status: "TODO",
    });

    const cardId = createResponse.body.id;

    const response = await request(app).get(`/api/cards/${cardId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(cardId);
    expect(response.body.title).toBe("Test Card");
  });

  test("GET /api/cards/:id should return 404 if card not found", async () => {
    const response = await request(app).get("/api/cards/non-existent-uuid");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Card not found");
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
    expect(response.body.id).toBeDefined();
    expect(typeof response.body.id).toBe("string");
    expect(response.body.id.length).toBe(36);
  });

  test("POST /api/cards should return 400 if title is missing", async () => {
    const cardData = {
      content: "Content without title",
    };

    const response = await request(app).post("/api/cards").send(cardData);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Title is required");
  });

  test("POST /api/cards should generate UUID", async () => {
    const cardData = {
      title: "UUID Test Card",
    };

    const response = await request(app).post("/api/cards").send(cardData);

    expect(response.status).toBe(201);
    expect(response.body.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
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
    expect(response.body.id).toBe(cardId);
  });

  test("PUT /api/cards/:id should return 404 if card not found", async () => {
    const updateData = {
      title: "Updated Title",
    };

    const invalidId = "invalid-uuid-12345";
    const response = await request(app)
      .put(`/api/cards/${invalidId}`)
      .send(updateData);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Card not found");
  });

  test("DELETE /api/cards/:id should delete a card", async () => {
    const cardData = {
      title: "Delete Test Card",
    };

    const createResponse = await request(app).post("/api/cards").send(cardData);
    const cardId = createResponse.body.id;

    const deleteResponse = await request(app).delete(`/api/cards/${cardId}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.message).toBe("Card deleted successfully");
  });

  test("DELETE /api/cards/:id should return 404 if card not found", async () => {
    const invalidId = "invalid-uuid-12345";
    const response = await request(app).delete(`/api/cards/${invalidId}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Card not found");
  });

  test("GET /api/cards should return cards with UUIDs", async () => {
    await request(app).post("/api/cards").send({ title: "Card 1" });
    await request(app).post("/api/cards").send({ title: "Card 2" });

    const response = await request(app).get("/api/cards");

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
    response.body.forEach((card: { id: string }) => {
      expect(card.id).toBeDefined();
      expect(typeof card.id).toBe("string");
    });
  });
});
