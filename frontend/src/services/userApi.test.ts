import { describe, test, expect, vi, beforeEach } from 'vitest';
import * as userApi from './userApi';
import type { User } from '../types';

describe('User API Service', () => {
  const mockUsers: User[] = [
    { id: '1', name: 'Alice', createdAt: '2024-01-01' },
    { id: '2', name: 'Bob', createdAt: '2024-01-02' },
  ];
  const mockUser: User = { id: '1', name: 'Alice', createdAt: '2024-01-01' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  describe('getUsers', () => {
    test('returns users on success', async () => {
      (global.fetch as vi.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve(mockUsers) });
      const result = await userApi.getUsers();
      expect(result).toEqual(mockUsers);
    });

    test('throws error on failure', async () => {
      (global.fetch as vi.Mock).mockResolvedValue({ ok: false });
      await expect(userApi.getUsers()).rejects.toThrow('Failed to get users');
    });
  });

  describe('createUser', () => {
    test('creates user and returns it', async () => {
      (global.fetch as vi.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve(mockUser) });
      const result = await userApi.createUser('Alice');
      expect(result).toEqual(mockUser);
    });

    test('throws error on failure', async () => {
      (global.fetch as vi.Mock).mockResolvedValue({ ok: false });
      await expect(userApi.createUser('Alice')).rejects.toThrow('Failed to create user');
    });
  });

  describe('updateUser', () => {
    test('updates user and returns it', async () => {
      const updatedUser = { ...mockUser, name: 'Alice Updated' };
      (global.fetch as vi.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve(updatedUser) });
      const result = await userApi.updateUser('1', 'Alice Updated');
      expect(result.name).toBe('Alice Updated');
    });

    test('throws error on failure', async () => {
      (global.fetch as vi.Mock).mockResolvedValue({ ok: false });
      await expect(userApi.updateUser('1', 'Alice Updated')).rejects.toThrow('Failed to update user');
    });
  });

  describe('deleteUser', () => {
    test('deletes user successfully', async () => {
      (global.fetch as vi.Mock).mockResolvedValue({ ok: true });
      await userApi.deleteUser('1');
      expect(global.fetch).toHaveBeenCalledWith('/api/users/1', { method: 'DELETE' });
    });

    test('throws error on failure', async () => {
      (global.fetch as vi.Mock).mockResolvedValue({ ok: false });
      await expect(userApi.deleteUser('1')).rejects.toThrow('Failed to delete user');
    });
  });
});