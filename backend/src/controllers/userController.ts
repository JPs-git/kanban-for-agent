import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/index.js';
import { SQLiteUserRepository } from '../repositories/index.js';
import { getParam } from '../utils/request.js';

const userRepository = new SQLiteUserRepository();
const userService = new UserService(userRepository);

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = userService.find();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getParam(req, 'id')!;
    const user = userService.findById(userId);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name } = req.body;
    const savedUser = userService.create({ name });
    res.status(201).json(savedUser);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getParam(req, 'id')!;
    const { name } = req.body;
    const user = userService.update(userId, { name });
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getParam(req, 'id')!;
    userService.delete(userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
