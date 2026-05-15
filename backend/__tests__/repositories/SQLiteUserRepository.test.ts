import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { SQLiteUserRepository } from '../../src/repositories/SQLiteUserRepository';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resetDB } from '../../src/config/sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('SQLiteUserRepository', () => {
  let repository: SQLiteUserRepository;
  let testDbPath: string;

  beforeEach(() => {
    testDbPath = path.join(__dirname, `../../data/test_user_repo_${Date.now()}.db`);
    process.env.SQLITE_PATH = testDbPath;
    resetDB();
    repository = new SQLiteUserRepository();
  });

  afterEach(() => {
    try {
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
      }
    } catch {
    }
  });

  test('should create a user', () => {
    const user = repository.create({ name: 'Test User' });
    
    expect(user.id).toBeDefined();
    expect(user.name).toBe('Test User');
    expect(user.createdAt).toBeDefined();
  });

  test('should find all users', () => {
    repository.create({ name: 'User 1' });
    repository.create({ name: 'User 2' });
    
    const users = repository.find();
    
    expect(users.length).toBe(2);
    expect(users[0].name).toBe('User 1');
    expect(users[1].name).toBe('User 2');
  });

  test('should find user by id', () => {
    const createdUser = repository.create({ name: 'Find Me' });
    
    const foundUser = repository.findById(createdUser.id);
    
    expect(foundUser).toBeDefined();
    expect(foundUser?.id).toBe(createdUser.id);
    expect(foundUser?.name).toBe('Find Me');
  });

  test('should return undefined when finding non-existent user', () => {
    const found = repository.findById('non-existent-uuid');
    
    expect(found).toBeUndefined();
  });

  test('should update user', () => {
    const createdUser = repository.create({ name: 'Original' });
    
    const updatedUser = repository.update(createdUser.id, { name: 'Updated' });
    
    expect(updatedUser).toBeDefined();
    expect(updatedUser?.name).toBe('Updated');
    expect(updatedUser?.updatedAt).toBeDefined();
  });

  test('should return undefined when updating non-existent user', () => {
    const result = repository.update('non-existent-uuid', { name: 'Updated' });
    
    expect(result).toBeUndefined();
  });

  test('should delete user', () => {
    const createdUser = repository.create({ name: 'To Delete' });
    
    const deletedUser = repository.delete(createdUser.id);
    
    expect(deletedUser).toBeDefined();
    expect(deletedUser?.name).toBe('To Delete');
    
    const found = repository.findById(createdUser.id);
    expect(found).toBeUndefined();
  });

  test('should return undefined when deleting non-existent user', () => {
    const result = repository.delete('non-existent-uuid');
    
    expect(result).toBeUndefined();
  });

  test('should trim user name', () => {
    const user = repository.create({ name: '  Trimmed Name  ' });
    
    expect(user.name).toBe('Trimmed Name');
  });

  test('should update with trimmed name', () => {
    const createdUser = repository.create({ name: 'Original' });
    
    const updated = repository.update(createdUser.id, { name: '  New Name  ' });
    
    expect(updated?.name).toBe('New Name');
  });
});