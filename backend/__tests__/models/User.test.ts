import { User } from '../../src/models/User';

describe('User Model - UUID Features', () => {
  test('should generate UUID when creating a user', () => {
    const user = User.create({ name: 'UUID Test User' });

    expect(user.id).toBeDefined();
    expect(typeof user.id).toBe('string');
    expect(user.id.length).toBe(36);
    expect(user.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  test('should create users with unique UUIDs', () => {
    const users = [];
    for (let i = 0; i < 10; i++) {
      users.push(User.create({ name: `User ${i}` }));
    }

    const ids = users.map(u => u.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(10);
  });

  test('should find user by UUID', () => {
    const user = User.create({ name: 'Find by UUID Test' });

    const foundUser = User.findById(user.id);
    expect(foundUser).toBeDefined();
    expect(foundUser?.id).toBe(user.id);
    expect(foundUser?.name).toBe('Find by UUID Test');
  });

  test('should not find user by invalid UUID', () => {
    const foundUser = User.findById('invalid-uuid');
    expect(foundUser).toBeUndefined();
  });

  test('should update user by UUID', () => {
    const user = User.create({ name: 'Update Test' });

    const updatedUser = User.findByIdAndUpdate(user.id, {
      name: 'Updated Name'
    });

    expect(updatedUser).toBeDefined();
    expect(updatedUser?.id).toBe(user.id);
    expect(updatedUser?.name).toBe('Updated Name');
  });

  test('should delete user by UUID', () => {
    const user = User.create({ name: 'Delete Test' });
    const userId = user.id;

    const deletedUser = User.findByIdAndDelete(userId);
    expect(deletedUser).toBeDefined();
    expect(deletedUser?.id).toBe(userId);

    const foundUser = User.findById(userId);
    expect(foundUser).toBeUndefined();
  });

  test('should return only users with UUID', () => {
    const users = User.find();
    users.forEach(user => {
      expect(user.id).toBeDefined();
      expect(typeof user.id).toBe('string');
      expect(user.id.length).toBe(36);
    });
  });

  test('should have properly formatted UUID', () => {
    const user = User.create({ name: 'UUID Format Test' });

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(user.id).toMatch(uuidRegex);
  });

  test('should preserve UUID after update', () => {
    const user = User.create({ name: 'Preserve UUID Test' });
    const originalId = user.id;

    const updatedUser = User.findByIdAndUpdate(originalId, {
      name: 'Updated'
    });

    expect(updatedUser?.id).toBe(originalId);
  });
});
