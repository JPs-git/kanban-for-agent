import { Request, Response } from 'express';
import { User } from '../models/User.js';

export const getUsers = (req: Request, res: Response) => {
  try {
    const users = User.find();
    res.status(200).json(users);
  } catch {
    res.status(500).json({ error: 'Failed to get users' });
  }
};

export const createUser = (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const savedUser = User.create({
      name: name.trim()
    });
    res.status(201).json(savedUser);
  } catch {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const updateUser = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const userId = Array.isArray(id) ? id[0] : id;
    const user = User.findByIdAndUpdate(
      parseInt(userId),
      { name: name.trim() }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const userId = Array.isArray(id) ? id[0] : id;
    const user = User.findByIdAndDelete(parseInt(userId));
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
