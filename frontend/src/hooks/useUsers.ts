import { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import * as userApi from '../services/userApi';
import { useErrorHandler } from './useErrorHandler';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { handleError, wrapAsync } = useErrorHandler();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userApi.getUsers();
      setUsers(data);
    } catch (err) {
      setError('获取用户列表失败');
      handleError(err, '获取用户列表失败');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const addUser = useCallback(async (name: string) => {
    return wrapAsync(async () => {
      const newUser = await userApi.createUser(name);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    }, '创建用户失败');
  }, [wrapAsync]);

  const updateUser = useCallback(async (id: string, name: string) => {
    return wrapAsync(async () => {
      const updatedUser = await userApi.updateUser(id, name);
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));
      return updatedUser;
    }, '更新用户失败');
  }, [wrapAsync]);

  const removeUser = useCallback(async (id: string) => {
    return wrapAsync(async () => {
      await userApi.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    }, '删除用户失败');
  }, [wrapAsync]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    addUser,
    updateUser,
    removeUser
  };
};