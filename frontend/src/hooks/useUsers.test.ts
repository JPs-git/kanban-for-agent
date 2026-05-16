import { describe, test, expect } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useUsers } from "./useUsers";
import * as userApi from "../services/userApi";
import type { User } from "../types";
import { ToastProvider } from "../context/ToastContext";

vi.mock("../services/userApi");

describe("useUsers Hook", () => {
  const mockUsers: User[] = [
    { id: "1", name: "Alice", createdAt: "2024-01-01" },
    { id: "2", name: "Bob", createdAt: "2024-01-02" },
  ];

  const mockNewUser: User = {
    id: "3",
    name: "Charlie",
    createdAt: "2024-01-03",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("initializes with loading state and fetches users", async () => {
    (userApi.getUsers as vi.Mock).mockResolvedValue(mockUsers);

    const { result } = renderHook(() => useUsers(), {
      wrapper: ToastProvider,
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.users).toEqual([]);
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.users).toEqual(mockUsers);
      expect(userApi.getUsers).toHaveBeenCalledTimes(1);
    });
  });

  test("handles error when fetching users", async () => {
    const mockError = new Error("Failed to fetch users");
    (userApi.getUsers as vi.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useUsers(), {
      wrapper: ToastProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("获取用户列表失败");
      expect(result.current.users).toEqual([]);
    });
  });

  test("adds a new user", async () => {
    (userApi.getUsers as vi.Mock).mockResolvedValue(mockUsers);
    (userApi.createUser as vi.Mock).mockResolvedValue(mockNewUser);

    const { result } = renderHook(() => useUsers(), {
      wrapper: ToastProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.addUser("Charlie");
    });

    expect(userApi.createUser).toHaveBeenCalledWith("Charlie");
    expect(result.current.users).toContainEqual(mockNewUser);
    expect(result.current.users.length).toBe(3);
  });

  test("handles error when adding user", async () => {
    (userApi.getUsers as vi.Mock).mockResolvedValue(mockUsers);
    (userApi.createUser as vi.Mock).mockRejectedValue(
      new Error("Failed to create"),
    );

    const { result } = renderHook(() => useUsers(), {
      wrapper: ToastProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const resultValue = await result.current.addUser("Charlie");
      expect(resultValue).toBeUndefined();
    });

    expect(result.current.users.length).toBe(2);
  });

  test("updates a user", async () => {
    (userApi.getUsers as vi.Mock).mockResolvedValue(mockUsers);
    const updatedUser = { ...mockUsers[0], name: "Alice Updated" };
    (userApi.updateUser as vi.Mock).mockResolvedValue(updatedUser);

    const { result } = renderHook(() => useUsers(), {
      wrapper: ToastProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateUser("1", "Alice Updated");
    });

    expect(userApi.updateUser).toHaveBeenCalledWith("1", "Alice Updated");
    expect(result.current.users[0].name).toBe("Alice Updated");
  });

  test("removes a user", async () => {
    (userApi.getUsers as vi.Mock).mockResolvedValue(mockUsers);
    (userApi.deleteUser as vi.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useUsers(), {
      wrapper: ToastProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.removeUser("1");
    });

    expect(userApi.deleteUser).toHaveBeenCalledWith("1");
    expect(result.current.users.length).toBe(1);
    expect(result.current.users[0].id).toBe("2");
  });

  test("refreshes users when fetchUsers is called", async () => {
    const newUsers: User[] = [
      { id: "3", name: "Refreshed", createdAt: "2024-01-03" },
    ];
    (userApi.getUsers as vi.Mock)
      .mockResolvedValueOnce(mockUsers)
      .mockResolvedValueOnce(newUsers);

    const { result } = renderHook(() => useUsers(), {
      wrapper: ToastProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toEqual(mockUsers);

    await act(async () => {
      await result.current.fetchUsers();
    });

    expect(userApi.getUsers).toHaveBeenCalledTimes(2);
    await waitFor(() => {
      expect(result.current.users).toEqual(newUsers);
    });
  });
});
