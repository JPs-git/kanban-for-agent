import request from "supertest";
import { CardStatus } from "../../src/models/Card";
import { app } from "../../src/server";

// 模拟Card模型
jest.mock("../../src/models/Card", () => {
  interface MockCard {
    _id: string;
    title: string;
    content: string;
    status: string;
    assignee?: string;
    assigneeName?: string;
    save: () => Promise<MockCard>;
  }

  const mockCards: MockCard[] = [];

  const mockCard = function (cardData: {
    title: string;
    content: string;
    status?: string;
    assignee?: string;
    assigneeName?: string;
  }) {
    const newCard: MockCard = {
      _id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: cardData.title,
      content: cardData.content,
      status: cardData.status || "TODO",
      assignee: cardData.assignee,
      assigneeName: cardData.assigneeName,
      save: async function () {
        mockCards.push(this);
        return this;
      },
    };
    return newCard;
  };

  // 静态方法
  mockCard.find = jest
    .fn()
    .mockImplementation(() => Promise.resolve(mockCards));
  mockCard.findById = jest.fn().mockImplementation((id: string) => {
    const card = mockCards.find((c) => c._id === id);
    return Promise.resolve(card || null);
  });
  mockCard.findByIdAndUpdate = jest.fn().mockImplementation(
    (
      id: string,
      update: {
        title?: string;
        content?: string;
        status?: string;
        assignee?: string;
        assigneeName?: string;
      }
    ) => {
      const index = mockCards.findIndex((c) => c._id === id);
      if (index === -1) {
        return Promise.resolve(null);
      }
      const updatedCard = { ...mockCards[index], ...update };
      mockCards[index] = updatedCard;
      return Promise.resolve(updatedCard);
    }
  );
  mockCard.findByIdAndDelete = jest.fn().mockImplementation((id: string) => {
    const index = mockCards.findIndex((c) => c._id === id);
    if (index === -1) {
      return Promise.resolve(null);
    }
    const deletedCard = mockCards[index];
    mockCards.splice(index, 1);
    return Promise.resolve(deletedCard);
  });
  mockCard.deleteMany = jest
    .fn()
    .mockImplementation(() =>
      Promise.resolve({ deletedCount: mockCards.length })
    );

  return {
    CardStatus: {
      TODO: "TODO",
      IN_PROGRESS: "IN_PROGRESS",
      DONE: "DONE",
      REJECTED: "REJECTED",
    },
    Card: mockCard,
  };
});

// 模拟数据库连接
jest.mock("../../src/config/db", () => {
  return {
    connectDB: jest.fn().mockImplementation(() => Promise.resolve()),
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
    const updateData = {
      title: "Updated Title",
      content: "Updated content",
      status: CardStatus.DONE,
    };

    // 使用一个测试ID
    const response = await request(app)
      .put("/api/cards/test-card-id")
      .send(updateData);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Card not found");
  });

  test("PUT /api/cards/:id should return 404 if card not found", async () => {
    const updateData = {
      title: "Updated Title",
    };

    // 使用一个不存在的ID
    const response = await request(app)
      .put("/api/cards/600000000000000000000000")
      .send(updateData);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Card not found");
  });

  test("DELETE /api/cards/:id should return 404 if card not found", async () => {
    // 使用一个不存在的ID
    const response = await request(app).delete(
      "/api/cards/600000000000000000000000"
    );

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Card not found");
  });
});
