import { IUser } from '../models/User.js';
import { UserRepository } from '../repositories/index.js';
import { ValidationError, NotFoundError } from '../errors/index.js';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  find(): IUser[] {
    return this.userRepository.find();
  }

  findById(uuid: string): IUser {
    const user = this.userRepository.findById(uuid);
    if (!user) {
      throw new NotFoundError('User not found', { field: 'id', reason: 'user does not exist' });
    }
    return user;
  }

  create(userData: { name: string }): IUser {
    if (!userData.name || userData.name.trim() === '') {
      throw new ValidationError('Name is required', { field: 'name', reason: 'must not be empty' });
    }
    return this.userRepository.create({ name: userData.name.trim() });
  }

  update(uuid: string, updateData: { name: string }): IUser {
    const existingUser = this.userRepository.findById(uuid);
    if (!existingUser) {
      throw new NotFoundError('User not found', { field: 'id', reason: 'user does not exist' });
    }

    if (!updateData.name || updateData.name.trim() === '') {
      throw new ValidationError('Name is required', { field: 'name', reason: 'must not be empty' });
    }

    const updatedUser = this.userRepository.update(uuid, { name: updateData.name.trim() });
    if (!updatedUser) {
      throw new NotFoundError('User not found', { field: 'id', reason: 'user does not exist' });
    }
    return updatedUser;
  }

  delete(uuid: string): IUser {
    const user = this.userRepository.findById(uuid);
    if (!user) {
      throw new NotFoundError('User not found', { field: 'id', reason: 'user does not exist' });
    }
    const deletedUser = this.userRepository.delete(uuid);
    if (!deletedUser) {
      throw new NotFoundError('User not found', { field: 'id', reason: 'user does not exist' });
    }
    return deletedUser;
  }
}