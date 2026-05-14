import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProcessManager } from '../../src/services/process_manager.js';
import { config } from '../../src/utils/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('ProcessManager', () => {
  const originalPidsPath = config.pidsPath;
  const tempDir = path.join(__dirname, 'temp-process');

  beforeEach(() => {
    config.set('paths.pids', path.join(tempDir, 'pids'));
    fs.mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    config.set('paths.pids', originalPidsPath);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should return null when PID file does not exist', () => {
    const manager = new ProcessManager();
    const pid = manager.getPid();
    expect(pid).toBe(null);
  });

  test('should write and read PID file', () => {
    const manager = new ProcessManager();
    manager.writePid(12345);
    const pid = manager.getPid();
    expect(pid).toBe(12345);
  });

  test('should cleanup PID file', () => {
    const manager = new ProcessManager();
    manager.writePid(12345);
    expect(fs.existsSync(manager.pidFile)).toBe(true);
    manager.cleanup();
    expect(fs.existsSync(manager.pidFile)).toBe(false);
  });

  test('should return false when process is not running', () => {
    const manager = new ProcessManager();
    const running = manager.isRunning();
    expect(running).toBe(false);
  });

  test('should get status when not running', () => {
    const manager = new ProcessManager();
    const status = manager.getStatus();
    expect(status.running).toBe(false);
    expect(status.pid).toBe(null);
  });
});
