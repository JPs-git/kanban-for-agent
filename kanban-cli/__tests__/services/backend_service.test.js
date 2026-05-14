import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('BackendService', () => {
  const originalHome = process.env.HOME;
  const tempDir = path.join(__dirname, 'temp-backend');

  beforeEach(() => {
    process.env.HOME = tempDir;
    fs.mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    process.env.HOME = originalHome;
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
  });

  test('should get correct start command', async () => {
    const { BackendService } = await import('../../src/services/backend_service.js');
    const service = new BackendService();
    const cmd = service.getStartCommand();
    expect(cmd).toEqual(['node', 'dist/server.js']);
  });

  test('should get correct environment variables', async () => {
    const { BackendService } = await import('../../src/services/backend_service.js');
    const { config } = await import('../../src/utils/config.js');
    const service = new BackendService();
    const env = service.getEnv();
    
    expect(env.NODE_ENV).toBe('production');
    expect(env.PORT).toBe(config.serverPort.toString());
    expect(env.SQLITE_PATH).toBe(path.join(config.dataPath, 'prod.db'));
  });

  test('should return true from stop if not running', async () => {
    const { BackendService } = await import('../../src/services/backend_service.js');
    const service = new BackendService();
    const result = await service.stop();
    expect(result).toBe(true);
  });

  test('should get status when not running', async () => {
    const { BackendService } = await import('../../src/services/backend_service.js');
    const service = new BackendService();
    const status = service.getStatus();
    expect(status.running).toBe(false);
    expect(status.pid).toBe(null);
  });
});
