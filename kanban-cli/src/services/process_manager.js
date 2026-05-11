import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn, spawnSync } from 'child_process';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';

class ProcessManager {
  constructor() {
    this.pidFile = path.join(config.pidsPath, 'backend.pid');
    this.process = null;
  }

  isRunning() {
    const pid = this.getPid();
    if (!pid) return false;

    try {
      process.kill(pid, 0);
      return true;
    } catch {
      this.cleanup();
      return false;
    }
  }

  getPid() {
    if (!fs.existsSync(this.pidFile)) return null;

    try {
      const content = fs.readFileSync(this.pidFile, 'utf8');
      return parseInt(content.trim(), 10);
    } catch {
      return null;
    }
  }

  writePid(pid) {
    const dir = path.dirname(this.pidFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.pidFile, pid.toString());
    logger.info(`PID ${pid} written to ${this.pidFile}`);
  }

  cleanup() {
    if (fs.existsSync(this.pidFile)) {
      fs.unlinkSync(this.pidFile);
      logger.debug(`Cleaned up PID file ${this.pidFile}`);
    }
  }

  async start(command, env) {
    if (this.isRunning()) {
      logger.warn('Backend is already running');
      return false;
    }

    this.cleanup();

    try {
      const mergedEnv = { ...process.env, ...env };
      mergedEnv.NODE_ENV = 'production';

      this.process = spawn(command[0], command.slice(1), {
        env: mergedEnv,
        cwd: path.join(config.repoPath, 'backend'),
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: true,
        windowsHide: true
      });

      this.writePid(this.process.pid);

      const logDir = path.join(config.logsPath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const logStream = fs.createWriteStream(
        path.join(config.logsPath, 'backend.log'),
        { flags: 'a' }
      );

      this.process.stdout.pipe(logStream);
      this.process.stderr.pipe(logStream);

      this.process.on('error', (err) => {
        logger.error(`Process error: ${err.message}`);
        this.cleanup();
      });

      this.process.on('exit', (code) => {
        logger.info(`Backend process exited with code ${code}`);
        this.cleanup();
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!this.process || this.process.exitCode !== null) {
        logger.error('Process exited immediately');
        this.cleanup();
        return false;
      }

      logger.info(`Backend started with PID ${this.process.pid}`);
      return true;

    } catch (err) {
      logger.error(`Failed to start backend: ${err.message}`);
      this.cleanup();
      return false;
    }
  }

  async stop() {
    const pid = this.getPid();
    if (!pid) {
      logger.warn('No PID file found, backend may not be running');
      return true;
    }

    if (!this.isRunning()) {
      logger.info('Backend is not running');
      this.cleanup();
      return true;
    }

    try {
      logger.info(`Sending SIGTERM to PID ${pid}`);
      
      if (process.platform === 'win32') {
        spawnSync('taskkill', ['/F', '/T', '/PID', pid.toString()]);
      } else {
        process.kill(pid, 'SIGTERM');
      }

      let attempts = 0;
      const maxAttempts = 20;

      while (attempts < maxAttempts) {
        if (!this.isRunning()) {
          logger.info('Backend stopped successfully');
          this.cleanup();
          return true;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }

      logger.warn('Graceful shutdown timed out, forcing...');
      if (process.platform === 'win32') {
        spawnSync('taskkill', ['/F', '/PID', pid.toString()]);
      } else {
        process.kill(pid, 'SIGKILL');
      }
      
      logger.info('Backend force stopped');
      this.cleanup();
      return true;

    } catch (err) {
      logger.error(`Error stopping backend: ${err.message}`);
      this.cleanup();
      return false;
    }
  }

  async restart(command, env) {
    logger.info('Restarting backend...');
    await this.stop();
    await new Promise(resolve => setTimeout(resolve, 1000));
    return this.start(command, env);
  }

  getStatus() {
    const pid = this.getPid();
    const running = this.isRunning();

    const status = {
      running,
      pid: running ? pid : null
    };

    return status;
  }
}

export { ProcessManager };
