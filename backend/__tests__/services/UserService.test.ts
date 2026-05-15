import { describe, test, expect, jest } from '@jest/globals';
import { UserService } from '../../src/services/UserService';
import { UserRepository } from '../../src/repositories/UserRepository';
import { IUser } from '../../src/models/User';
import { ValidationError, NotFoundError } from '../../src/errors';

const createMockUser = (overrides: Partial<IUser> = {}): IUser => ({
  id: 'test-uuid',
  name: 'Test User',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('UserService', () => {
  let mockRepository: jest.Mocked<UserRepository>;
  let service: UserService;

  beforeEach(() => {
    mockRepository = {
      find: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    service = new UserService(mockRepository);
  });

  describe('find', () => {
    test('should return all users from repository', () => {
      const users = [createMockUser()];
      mockRepository.find.mockReturnValue(users);

      const result = service.find();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findById', () => {
    test('should return user when found', () => {
      const user = createMockUser();
      mockRepository.findById.mockReturnValue(user);

      const result = service.findById('test-uuid');

      expect(mockRepository.findById).toHaveBeenCalledWith('test-uuid');
      expect(result).toEqual(user);
    });

    test('should throw NotFoundError when user not found', () => {
      mockRepository.findById.mockReturnValue(undefined);

      expect(() => service.findById('non-existent')).toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    test('should create user with valid data', () => {
      const userData = { name: 'New User' };
      const createdUser = createMockUser({ name: 'New User' });
      mockRepository.create.mockReturnValue(createdUser);

      const result = service.create(userData);

      expect(mockRepository.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(createdUser);
    });

    test('should throw ValidationError when name is empty', () => {
      expect(() => service.create({ name: '' })).toThrow(ValidationError);
      expect(() => service.create({ name: '   ' })).toThrow(ValidationError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    test('should throw ValidationError when name is missing', () => {
      // @ts-expect-error testing missing name
      expect(() => service.create({})).toThrow(ValidationError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    test('should update user with valid data', () => {
      const existingUser = createMockUser();
      const updatedUser = createMockUser({ name: 'Updated User' });
      mockRepository.findById.mockReturnValue(existingUser);
      mockRepository.update.mockReturnValue(updatedUser);

      const result = service.update('test-uuid', { name: 'Updated User' });

      expect(mockRepository.findById).toHaveBeenCalledWith('test-uuid');
      expect(mockRepository.update).toHaveBeenCalledWith('test-uuid', { name: 'Updated User' });
      expect(result).toEqual(updatedUser);
    });

    test('should throw NotFoundError when user not found', () => {
      mockRepository.findById.mockReturnValue(undefined);

      expect(() => service.update('non-existent', { name: 'Updated' })).toThrow(NotFoundError);
    });

    test('should throw ValidationError when name is empty string', () => {
      const existingUser = createMockUser();
      mockRepository.findById.mockReturnValue(existingUser);

      expect(() => service.update('test-uuid', { name: '' })).toThrow(ValidationError);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    test('should throw ValidationError when name is only whitespace', () => {
      const existingUser = createMockUser();
      mockRepository.findById.mockReturnValue(existingUser);

      expect(() => service.update('test-uuid', { name: '   ' })).toThrow(ValidationError);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    test('should throw NotFoundError when repository update returns undefined', () => {
      const existingUser = createMockUser();
      mockRepository.findById.mockReturnValue(existingUser);
      mockRepository.update.mockReturnValue(undefined);

      expect(() => service.update('test-uuid', { name: 'Updated' })).toThrow(NotFoundError);
    });

    test('should trim name before updating', () => {
      const existingUser = createMockUser();
      const updatedUser = createMockUser({ name: 'Trimmed Name' });
      mockRepository.findById.mockReturnValue(existingUser);
      mockRepository.update.mockReturnValue(updatedUser);

      const result = service.update('test-uuid', { name: '  Trimmed Name  ' });

      expect(mockRepository.update).toHaveBeenCalledWith('test-uuid', { name: 'Trimmed Name' });
      expect(result.name).toBe('Trimmed Name');
    });
  });

  describe('delete', () => {
    test('should delete existing user', () => {
      const user = createMockUser();
      mockRepository.findById.mockReturnValue(user);
      mockRepository.delete.mockReturnValue(user);

      const result = service.delete('test-uuid');

      expect(mockRepository.findById).toHaveBeenCalledWith('test-uuid');
      expect(mockRepository.delete).toHaveBeenCalledWith('test-uuid');
      expect(result).toEqual(user);
    });

    test('should throw NotFoundError when user not found', () => {
      mockRepository.findById.mockReturnValue(undefined);

      expect(() => service.delete('non-existent')).toThrow(NotFoundError);
    });

    test('should throw NotFoundError when repository delete returns undefined', () => {
      const user = createMockUser();
      mockRepository.findById.mockReturnValue(user);
      mockRepository.delete.mockReturnValue(undefined);

      expect(() => service.delete('test-uuid')).toThrow(NotFoundError);
    });
  });
});