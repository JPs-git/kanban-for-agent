import { MigrationManager } from '../../src/config/migration';
import Database from 'better-sqlite3';

describe('MigrationManager', () => {
  let db: Database.Database;
  let manager: MigrationManager;

  beforeEach(() => {
    db = new Database(':memory:');
    manager = new MigrationManager(db);
  });

  afterEach(() => {
    db.close();
  });

  test('should initialize schema_migrations table', () => {
    const result = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'"
    ).get() as { name: string } | undefined;
    expect(result).toBeDefined();
    expect(result?.name).toBe('schema_migrations');
  });

  test('should register migrations', () => {
    const migration = {
      version: '001',
      name: 'test_migration',
      up: jest.fn()
    };

    manager.registerMigration(migration);
    const status = manager.getMigrationStatus();
    expect(status.pending).toHaveLength(1);
    expect(status.pending[0].version).toBe('001');
    expect(status.pending[0].name).toBe('test_migration');
  });

  test('should run pending migrations', async () => {
    const upMock = jest.fn();
    
    manager.registerMigration({
      version: '001',
      name: 'test_migration',
      up: upMock
    });

    await manager.runPendingMigrations();

    expect(upMock).toHaveBeenCalledTimes(1);
    expect(upMock).toHaveBeenCalledWith(db);
  });

  test('should track applied migrations', async () => {
    manager.registerMigration({
      version: '001',
      name: 'test_migration',
      up: jest.fn()
    });

    await manager.runPendingMigrations();

    const status = manager.getMigrationStatus();
    expect(status.applied).toHaveLength(1);
    expect(status.applied[0].version).toBe('001');
    expect(status.pending).toHaveLength(0);
  });

  test('should not run already applied migrations', async () => {
    const upMock = jest.fn();
    
    manager.registerMigration({
      version: '001',
      name: 'test_migration',
      up: upMock
    });

    await manager.runPendingMigrations();
    await manager.runPendingMigrations();

    expect(upMock).toHaveBeenCalledTimes(1);
  });

  test('should run migrations in order', async () => {
    const order: string[] = [];

    manager.registerMigration({
      version: '002',
      name: 'second',
      up: () => order.push('002')
    });

    manager.registerMigration({
      version: '001',
      name: 'first',
      up: () => order.push('001')
    });

    await manager.runPendingMigrations();

    expect(order).toEqual(['001', '002']);
  });

  test('should handle migration errors gracefully', async () => {
    const error = new Error('Migration failed');
    manager.registerMigration({
      version: '001',
      name: 'failing_migration',
      up: () => { throw error; }
    });

    await expect(manager.runPendingMigrations()).rejects.toThrow(error);
  });

  test('should handle empty migrations list', async () => {
    await manager.runPendingMigrations();
    
    const status = manager.getMigrationStatus();
    expect(status.applied).toHaveLength(0);
    expect(status.pending).toHaveLength(0);
  });

  test('should store migration metadata', async () => {
    manager.registerMigration({
      version: '001',
      name: 'test_migration',
      up: jest.fn()
    });

    await manager.runPendingMigrations();

    const migration = db.prepare(
      'SELECT * FROM schema_migrations WHERE version = ?'
    ).get('001') as { version: string; name: string; applied_at: string } | undefined;

    expect(migration).toBeDefined();
    expect(migration?.version).toBe('001');
    expect(migration?.name).toBe('test_migration');
    expect(migration?.applied_at).toBeDefined();
  });

  test('should return migration status correctly', async () => {
    manager.registerMigration({
      version: '001',
      name: 'applied',
      up: jest.fn()
    });

    await manager.runPendingMigrations();

    manager.registerMigration({
      version: '002',
      name: 'pending',
      up: jest.fn()
    });

    const status = manager.getMigrationStatus();
    expect(status.applied).toHaveLength(1);
    expect(status.applied[0].version).toBe('001');
    expect(status.pending).toHaveLength(1);
    expect(status.pending[0].version).toBe('002');
  });
});
