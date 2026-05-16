import { describe, test, expect, vi, beforeEach } from "vitest";
import * as userApi from "./userApi";
import { RequestError } from "./errorHandler";

describe("User API Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUsers", () => {
    test("returns users on success", async () => {
      const mockUsers = [{ id: "1", name: "Alice", createdAt: "2024-01-01" }];
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockUsers,
      });
      vi.spyOn(global, "fetch").mockImplementation(mockFetch);

      const result = await userApi.getUsers();
      expect(result).toEqual(mockUsers);
    });

    test("throws RequestError on failure", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        url: "/api/users",
        json: async () => ({ code: "INTERNAL_ERROR", message: "Server error" }),
      });
      vi.spyOn(global, "fetch").mockImplementation(mockFetch);

      await expect(userApi.getUsers()).rejects.toThrow(RequestError);
    });
  });

  describe("createUser", () => {
    test("creates user and returns it", async () => {
      const mockUser = { id: "1", name: "Alice", createdAt: "2024-01-01" };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });
      vi.spyOn(global, "fetch").mockImplementation(mockFetch);

      const result = await userApi.createUser("Alice");
      expect(result).toEqual(mockUser);
    });

    test("throws RequestError on failure", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        url: "/api/users",
        json: async () => ({
          code: "VALIDATION_ERROR",
          message: "Validation failed",
        }),
      });
      vi.spyOn(global, "fetch").mockImplementation(mockFetch);

      await expect(userApi.createUser("Alice")).rejects.toThrow(RequestError);
    });
  });

  describe("updateUser", () => {
    test("updates user and returns it", async () => {
      const mockUser = {
        id: "1",
        name: "Alice Updated",
        createdAt: "2024-01-01",
      };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });
      vi.spyOn(global, "fetch").mockImplementation(mockFetch);

      const result = await userApi.updateUser("1", "Alice Updated");
      expect(result).toEqual(mockUser);
    });

    test("throws RequestError on failure", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        url: "/api/users/1",
        json: async () => ({ code: "NOT_FOUND", message: "User not found" }),
      });
      vi.spyOn(global, "fetch").mockImplementation(mockFetch);

      await expect(userApi.updateUser("1", "Alice Updated")).rejects.toThrow(
        RequestError,
      );
    });
  });

  describe("deleteUser", () => {
    test("deletes user successfully", async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true });
      vi.spyOn(global, "fetch").mockImplementation(mockFetch);

      await userApi.deleteUser("1");
      expect(global.fetch).toHaveBeenCalled();
    });

    test("throws RequestError on failure", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        url: "/api/users/1",
        json: async () => ({ code: "NOT_FOUND", message: "User not found" }),
      });
      vi.spyOn(global, "fetch").mockImplementation(mockFetch);

      await expect(userApi.deleteUser("1")).rejects.toThrow(RequestError);
    });
  });
});
