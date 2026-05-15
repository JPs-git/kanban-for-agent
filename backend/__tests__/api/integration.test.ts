import request from "supertest";
import type { Express } from "express";

describe("API Integration Tests", () => {
  let app: Express;
  let createdCardId: string;
  let createdUserId: string;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    const { app: serverApp } = await import("../../src/server");
    app = serverApp;
  });

  afterAll(() => {
    process.env.NODE_ENV = "development";
  });

  describe("Cards API", () => {
    test("POST /api/cards should create a card with UUID", async () => {
      const response = await request(app).post("/api/cards").send({
        title: "Integration Test Card",
        content: "API integration test",
        status: "TODO",
      });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.id.length).toBe(36);
      expect(response.body.title).toBe("Integration Test Card");
      expect(response.body.content).toBe("API integration test");
      expect(response.body.status).toBe("TODO");
      expect(response.body.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );

      createdCardId = response.body.id;
    });

    test("GET /api/cards should return all cards", async () => {
      const response = await request(app).get("/api/cards");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      response.body.forEach((card: { id: string; title: string }) => {
        expect(card.id).toBeDefined();
        expect(card.id.length).toBe(36);
        expect(card.title).toBeDefined();
      });
    });

    test("GET /api/cards/:id should return a single card", async () => {
      const response = await request(app).get(`/api/cards/${createdCardId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdCardId);
      expect(response.body.title).toBe("Integration Test Card");
    });

    test("GET /api/cards/:id should return 404 for non-existent card", async () => {
      const response = await request(app).get("/api/cards/non-existent-uuid");

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe("Card not found");
    });

    test("PUT /api/cards/:id should update a card", async () => {
      const response = await request(app)
        .put(`/api/cards/${createdCardId}`)
        .send({
          title: "Updated Integration Card",
          status: "IN_PROGRESS",
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdCardId);
      expect(response.body.title).toBe("Updated Integration Card");
      expect(response.body.status).toBe("IN_PROGRESS");
    });

    test("PUT /api/cards/:id should return 404 for non-existent card", async () => {
      const response = await request(app)
        .put("/api/cards/non-existent-uuid")
        .send({
          title: "Updated",
        });

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe("Card not found");
    });

    test("POST /api/cards should return 400 without title", async () => {
      const response = await request(app).post("/api/cards").send({
        content: "No title",
      });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe("Title is required");
    });

    test("DELETE /api/cards/:id should delete a card", async () => {
      const response = await request(app).delete(`/api/cards/${createdCardId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Card deleted successfully");

      const getResponse = await request(app).get(`/api/cards/${createdCardId}`);
      expect(getResponse.status).toBe(404);
    });

    test("DELETE /api/cards/:id should return 404 for non-existent card", async () => {
      const response = await request(app).delete(
        "/api/cards/non-existent-uuid",
      );

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe("Card not found");
    });
  });

  describe("Users API", () => {
    test("POST /api/users should create a user with UUID", async () => {
      const response = await request(app).post("/api/users").send({
        name: "Integration Test User",
      });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.id.length).toBe(36);
      expect(response.body.name).toBe("Integration Test User");
      expect(response.body.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );

      createdUserId = response.body.id;
    });

    test("GET /api/users should return all users", async () => {
      const response = await request(app).get("/api/users");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      response.body.forEach((user: { id: string; name: string }) => {
        expect(user.id).toBeDefined();
        expect(user.id.length).toBe(36);
        expect(user.name).toBeDefined();
      });
    });

    test("GET /api/users/:id should return a single user", async () => {
      const response = await request(app).get(`/api/users/${createdUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdUserId);
      expect(response.body.name).toBe("Integration Test User");
    });

    test("GET /api/users/:id should return 404 for non-existent user", async () => {
      const response = await request(app).get("/api/users/non-existent-uuid");

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe("User not found");
    });

    test("PUT /api/users/:id should update a user", async () => {
      const response = await request(app)
        .put(`/api/users/${createdUserId}`)
        .send({
          name: "Updated Integration User",
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdUserId);
      expect(response.body.name).toBe("Updated Integration User");
    });

    test("PUT /api/users/:id should return 404 for non-existent user", async () => {
      const response = await request(app)
        .put("/api/users/non-existent-uuid")
        .send({
          name: "Updated",
        });

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe("User not found");
    });

    test("POST /api/users should return 400 without name", async () => {
      const response = await request(app).post("/api/users").send({});

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe("Name is required");
    });

    test("DELETE /api/users/:id should delete a user", async () => {
      const response = await request(app).delete(`/api/users/${createdUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User deleted successfully");

      const getResponse = await request(app).get(`/api/users/${createdUserId}`);
      expect(getResponse.status).toBe(404);
    });

    test("DELETE /api/users/:id should return 404 for non-existent user", async () => {
      const response = await request(app).delete(
        "/api/users/non-existent-uuid",
      );

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe("User not found");
    });
  });

  describe("UUID Generation", () => {
    test("should generate unique UUIDs for multiple cards", async () => {
      const cardIds: string[] = [];

      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post("/api/cards")
          .send({
            title: `Unique Card ${i}`,
          });
        cardIds.push(response.body.id);
      }

      const uniqueIds = new Set(cardIds);
      expect(uniqueIds.size).toBe(5);

      cardIds.forEach((id) => {
        expect(id.length).toBe(36);
        expect(id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        );
      });

      await Promise.all(
        cardIds.map((id) => request(app).delete(`/api/cards/${id}`)),
      );
    });

    test("should generate unique UUIDs for multiple users", async () => {
      const userIds: string[] = [];

      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post("/api/users")
          .send({
            name: `Unique User ${i}`,
          });
        userIds.push(response.body.id);
      }

      const uniqueIds = new Set(userIds);
      expect(uniqueIds.size).toBe(5);

      userIds.forEach((id) => {
        expect(id.length).toBe(36);
        expect(id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        );
      });

      await Promise.all(
        userIds.map((id) => request(app).delete(`/api/users/${id}`)),
      );
    });
  });
});