import { describe, test, expect, vi, beforeEach } from "vitest";
import * as api from "./api";
import { CardStatus } from "../types";
import { RequestError } from "./errorHandler";

describe("API Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getVersion", () => {
    test("returns version info on success", async () => {
      const mockVersion = { version: "1.0.0", environment: "development" };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockVersion,
      });
      vi.spyOn(global, "fetch").mockImplementation(mockFetch);

      const result = await api.getVersion();
      expect(result).toEqual(mockVersion);
    });

    test("throws RequestError on failure", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        url: "/api/version",
        json: async () => ({ code: "INTERNAL_ERROR", message: "Server error" }),
      });
      vi.spyOn(global, "fetch").mockImplementation(mockFetch);

      await expect(api.getVersion()).rejects.toThrow(RequestError);
    });
  });

  describe("getCards", () => {
    test("returns cards on success", async () => {
      const mockCards = [
        {
          id: "1",
          title: "Test",
          content: "Desc",
          status: CardStatus.TODO,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ];
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCards,
      });
      vi.spyOn(global, "fetch").mockImplementation(mockFetch);

      const result = await api.getCards();
      expect(result).toEqual(mockCards);
    });

    test("throws RequestError on failure", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        url: "/api/cards",
        json: async () => ({ code: "INTERNAL_ERROR", message: "Server error" }),
      });
      vi.spyOn(global, "fetch").mockImplementation(mockFetch);

      await expect(api.getCards()).rejects.toThrow(RequestError);
    });
  });

  describe("createCard", () => {
    test("creates card and returns it", async () => {
      const mockCard = {
        id: "1",
        title: "Test",
        content: "Desc",
        status: CardStatus.TODO,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCard,
      });
      vi.spyOn(global, "fetch").mockImplementation(mockFetch);

      const result = await api.createCard({ title: "Test", content: "Desc" });
      expect(result).toEqual(mockCard);
    });

    test("throws RequestError on failure", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        url: "/api/cards",
        json: async () => ({
          code: "VALIDATION_ERROR",
          message: "Validation failed",
        }),
      });
      vi.spyOn(global, "fetch").mockImplementation(mockFetch);

      await expect(
        api.createCard({ title: "Test", content: "Desc" }),
      ).rejects.toThrow(RequestError);
    });
  });

  describe("updateCard", () => {
    test("updates card and returns it", async () => {
      const mockCard = {
        id: "1",
        title: "Updated",
        content: "Desc",
        status: CardStatus.DONE,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-02",
      };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCard,
      });
      vi.spyOn(global, "fetch").mockImplementation(mockFetch);

      const result = await api.updateCard("1", { status: CardStatus.DONE });
      expect(result).toEqual(mockCard);
    });

    test("throws RequestError on failure", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        statusText: "Conflict",
        url: "/api/cards/1",
        json: async () => ({
          code: "BUSINESS_RULE_VIOLATION",
          message: "Status transition not allowed",
        }),
      });
      vi.spyOn(global, "fetch").mockImplementation(mockFetch);

      await expect(
        api.updateCard("1", { status: CardStatus.DONE }),
      ).rejects.toThrow(RequestError);
    });
  });

  describe("deleteCard", () => {
    test("deletes card successfully", async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true });
      vi.spyOn(global, "fetch").mockImplementation(mockFetch);

      await api.deleteCard("1");
      expect(global.fetch).toHaveBeenCalled();
    });

    test("throws RequestError on failure", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        url: "/api/cards/1",
        json: async () => ({ code: "NOT_FOUND", message: "Card not found" }),
      });
      vi.spyOn(global, "fetch").mockImplementation(mockFetch);

      await expect(api.deleteCard("1")).rejects.toThrow(RequestError);
    });
  });
});
