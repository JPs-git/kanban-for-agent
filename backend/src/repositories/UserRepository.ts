import { IUser } from '../models/User.js';

export abstract class UserRepository {
  abstract find(): IUser[];
  abstract findById(uuid: string): IUser | undefined;
  abstract create(userData: { name: string }): IUser;
  abstract update(uuid: string, updateData: { name: string }): IUser | undefined;
  abstract delete(uuid: string): IUser | undefined;
}