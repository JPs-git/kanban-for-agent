import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { ProcessManager } from './process_manager.js';
import { GitService } from './git_service.js';
import { BuildService } from './build_service.js';

class BackendService {
  constructor() {
    this.processManager = new ProcessManager();
    this.gitService = new GitService();
    this.buildService = new BuildService();
  }

  getStartCommand() {
    return ['node', 'dist/server.js'];
  }

  getEnv() {
    return {
      NODE_ENV: 'production',
      PORT: config.serverPort.toString(),
      SQLITE_PATH: path.join(config.dataPath, 'prod.db')
    };
  }

  async deploy(repoUrl) {
    logger.info('Starting deployment...');

    if (!this.buildService.fullBuild()) {
      return false;
    }

    if (!this.runMigrations()) {
      return false;
    }

    logger.info('Deployment completed successfully!');
    return true;
  }

  async update(repoUrl) {
    logger.info('Pulling latest changes...');

    if (!this.gitService.cloneOrPull(repoUrl)) {
      return false;
    }

    if (!this.buildService.fullBuild()) {
      return false;
    }

    if (!this.runMigrations()) {
      return false;
    }

    logger.info('Update completed successfully!');
    return true;
  }

  runMigrations() {
    const migrationCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const migrationArgs = ['tsx', 'src/migrate.ts'];

    logger.info('Running database migrations...');

    try {
      const result = spawnSync(migrationCmd, migrationArgs, {
        cwd: path.join(config.repoPath, 'backend'),
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: process.platform === 'win32',
        env: {
          ...process.env,
          NODE_ENV: process.env.NODE_ENV || 'production',
          SQLITE_PATH: path.join(config.dataPath, 'prod.db')
        }
      });

      if (result.status !== 0) {
        const errorOutput = result.stderr ? result.stderr.toString() : result.stdout ? result.stdout.toString() : 'Unknown error';
        logger.error(`Migration failed: ${errorOutput}`);
        return false;
      }

      if (result.stdout) {
        console.log(result.stdout.toString());
      }

      logger.info('Database migrations completed successfully');
      return true;
    } catch (err) {
      logger.error(`Failed to run migrations: ${err.message}`);
      return false;
    }
  }

  async start() {
    if (!this.processManager.isRunning()) {
      const command = this.getStartCommand();
      return this.processManager.start(command, this.getEnv());
    } else {
      logger.info('Backend is already running');
      return true;
    }
  }

  async stop() {
    return this.processManager.stop();
  }

  async restart() {
    const command = this.getStartCommand();
    return this.processManager.restart(command, this.getEnv());
  }

  getStatus() {
    const status = this.processManager.getStatus();

    if (fs.existsSync(this.gitService.repoPath)) {
      status.commit = this.gitService.getCurrentCommit();
      status.branch = this.gitService.getCurrentBranch();
    }

    return status;
  }

  getLogs(lines = 50) {
    const logFile = path.join(config.logsPath, 'backend.log');
    if (!fs.existsSync(logFile)) {
      return [];
    }

    try {
      const content = fs.readFileSync(logFile, 'utf8');
      const allLines = content.split('\n').filter(line => line.trim());
      return allLines.slice(-lines);
    } catch (err) {
      logger.error(`Failed to read logs: ${err.message}`);
      return [];
    }
  }
}

export { BackendService };
