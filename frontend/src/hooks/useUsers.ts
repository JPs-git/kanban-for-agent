import { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import * as userApi from '../services/userApi';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userApi.getUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addUser = useCallback(async (name: string) => {
    try {
      const newUser = await userApi.createUser(name);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      setError('Failed to create user');
      console.error(err);
      throw err;
    }
  }, []);

  const updateUser = useCallback(async (id: string, name: string) => {
    try {
      const updatedUser = await userApi.updateUser(id, name);
      setUsers(prev => prev.map(user => user._id === id ? updatedUser : user));
      return updatedUser;
    } catch (err) {
      setError('Failed to update user');
      console.error(err);
      throw err;
    }
  }, []);

  const removeUser = useCallback(async (id: string) => {
    try {
      await userApi.deleteUser(id);
      setUsers(prev => prev.filter(user => user._id !== id));
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
      throw err;
    }
  }, []);

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
