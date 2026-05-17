import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  deploy,
  update,
  start,
  stop,
  status,
  restart,
  logs,
  __setBackendService,
  __setLogger
} from '../../src/commands/index.js';

describe('CLI Commands', () => {
  let mockBackendService;
  let mockLogger;

  beforeEach(() => {
    mockBackendService = {
      deploy: jest.fn(),
      update: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      restart: jest.fn(),
      getStatus: jest.fn(),
      getLogs: jest.fn(),
    };

    mockLogger = {
      success: jest.fn(),
      failure: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    };

    __setBackendService(jest.fn(() => mockBackendService));
    __setLogger(mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('deploy', () => {
    test('deploys successfully', async () => {
      mockBackendService.deploy.mockResolvedValue(true);
      mockBackendService.start.mockResolvedValue(true);

      await deploy('https://github.com/test/repo');

      expect(mockBackendService.deploy).toHaveBeenCalledWith('https://github.com/test/repo');
      expect(mockBackendService.start).toHaveBeenCalled();
      expect(mockLogger.success).toHaveBeenCalledWith('Deployment completed successfully!');
    });

    test('handles deployment failure', async () => {
      mockBackendService.deploy.mockResolvedValue(false);
      const originalExit = process.exit;
      const mockExit = jest.fn();
      process.exit = mockExit;

      await deploy('https://github.com/test/repo');

      expect(mockLogger.failure).toHaveBeenCalledWith('Deployment failed. Check logs for details.');
      expect(mockExit).toHaveBeenCalledWith(1);
      process.exit = originalExit;
    });
  });

  describe('update', () => {
    test('updates successfully', async () => {
      mockBackendService.update.mockResolvedValue(true);
      mockBackendService.restart.mockResolvedValue(true);

      await update();

      expect(mockBackendService.update).toHaveBeenCalled();
      expect(mockBackendService.restart).toHaveBeenCalled();
      expect(mockLogger.success).toHaveBeenCalledWith('Update completed successfully!');
    });

    test('handles update failure', async () => {
      mockBackendService.update.mockResolvedValue(false);
      const originalExit = process.exit;
      const mockExit = jest.fn();
      process.exit = mockExit;

      await update();

      expect(mockLogger.failure).toHaveBeenCalledWith('Update failed. Check logs for details.');
      expect(mockExit).toHaveBeenCalledWith(1);
      process.exit = originalExit;
    });
  });

  describe('start', () => {
    test('starts successfully with foreground mode', async () => {
      mockBackendService.start.mockResolvedValue(true);

      await start();

      expect(mockBackendService.start).toHaveBeenCalledWith({ foreground: true });
      expect(mockLogger.success).toHaveBeenCalledWith('Kanban service started successfully!');
    });

    test('starts with foreground option explicitly set', async () => {
      mockBackendService.start.mockResolvedValue(true);

      await start();

      expect(mockBackendService.start).toHaveBeenCalledWith({ foreground: true });
    });

    test('handles start failure', async () => {
      mockBackendService.start.mockResolvedValue(false);
      const originalExit = process.exit;
      const mockExit = jest.fn();
      process.exit = mockExit;

      await start();

      expect(mockLogger.failure).toHaveBeenCalledWith('Failed to start Kanban service. Check if it is already running.');
      expect(mockExit).toHaveBeenCalledWith(1);
      process.exit = originalExit;
    });
  });

  describe('stop', () => {
    test('stops successfully', async () => {
      mockBackendService.stop.mockResolvedValue(true);

      await stop();

      expect(mockBackendService.stop).toHaveBeenCalled();
      expect(mockLogger.success).toHaveBeenCalledWith('Kanban service stopped successfully!');
    });

    test('handles stop failure', async () => {
      mockBackendService.stop.mockResolvedValue(false);
      const originalExit = process.exit;
      const mockExit = jest.fn();
      process.exit = mockExit;

      await stop();

      expect(mockLogger.failure).toHaveBeenCalledWith('Failed to stop Kanban service.');
      expect(mockExit).toHaveBeenCalledWith(1);
      process.exit = originalExit;
    });
  });

  describe('status', () => {
    test('shows running status', () => {
      mockBackendService.getStatus.mockReturnValue({
        running: true,
        pid: 12345,
        branch: 'main',
        commit: 'abcdef123456'
      });

      status();

      expect(mockBackendService.getStatus).toHaveBeenCalled();
    });

    test('shows not running status', () => {
      mockBackendService.getStatus.mockReturnValue({ running: false });

      status();

      expect(mockBackendService.getStatus).toHaveBeenCalled();
    });
  });

  describe('restart', () => {
    test('restarts successfully', async () => {
      mockBackendService.restart.mockResolvedValue(true);

      await restart();

      expect(mockBackendService.restart).toHaveBeenCalled();
      expect(mockLogger.success).toHaveBeenCalledWith('Kanban service restarted successfully!');
    });

    test('handles restart failure', async () => {
      mockBackendService.restart.mockResolvedValue(false);
      const originalExit = process.exit;
      const mockExit = jest.fn();
      process.exit = mockExit;

      await restart();

      expect(mockLogger.failure).toHaveBeenCalledWith('Failed to restart Kanban service.');
      expect(mockExit).toHaveBeenCalledWith(1);
      process.exit = originalExit;
    });
  });

  describe('logs', () => {
    test('shows logs', () => {
      mockBackendService.getLogs.mockReturnValue(['Log line 1', 'Log line 2']);

      logs(2);

      expect(mockBackendService.getLogs).toHaveBeenCalledWith(2);
    });

    test('handles no logs', () => {
      mockBackendService.getLogs.mockReturnValue([]);

      logs();

      expect(mockBackendService.getLogs).toHaveBeenCalledWith(50);
    });
  });
});