import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';

class GitService {
  constructor() {
    this.repoPath = config.repoPath;
  }

  isGitAvailable() {
    try {
      const result = spawnSync('git', ['--version'], {
        stdio: ['ignore', 'ignore', 'ignore']
      });
      return result.status === 0;
    } catch {
      return false;
    }
  }

  cloneOrPull(url, branch) {
    const repoUrl = url || config.repoUrl;
    const repoBranch = branch || config.repoBranch;

    if (!this.isGitAvailable()) {
      logger.error('Git is not installed or not found in PATH');
      return false;
    }

    try {
      if (fs.existsSync(this.repoPath) && fs.existsSync(path.join(this.repoPath, '.git'))) {
        logger.info(`Pulling latest changes from ${repoBranch}...`);
        const result = spawnSync('git', ['pull', 'origin', repoBranch], {
          cwd: this.repoPath,
          stdio: ['ignore', 'pipe', 'pipe']
        });

        if (result.status !== 0) {
          logger.error(`Git pull failed: ${result.stderr.toString()}`);
          return false;
        }
        logger.info('Pull completed successfully');
        return true;
      } else {
        logger.info(`Cloning repository from ${repoUrl}...`);
        const dir = path.dirname(this.repoPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        const result = spawnSync('git', ['clone', '-b', repoBranch, repoUrl, this.repoPath], {
          stdio: ['ignore', 'pipe', 'pipe']
        });

        if (result.status !== 0) {
          logger.error(`Git clone failed: ${result.stderr.toString()}`);
          return false;
        }
        logger.info('Clone completed successfully');
        return true;
      }
    } catch (err) {
      logger.error(`Git operation failed: ${err.message}`);
      return false;
    }
  }

  getCurrentCommit() {
    try {
      const result = spawnSync('git', ['rev-parse', 'HEAD'], {
        cwd: this.repoPath,
        stdio: ['ignore', 'pipe', 'ignore']
      });
      return result.status === 0 ? result.stdout.toString().trim() : 'unknown';
    } catch {
      return 'unknown';
    }
  }

  getCurrentBranch() {
    try {
      const result = spawnSync('git', ['branch', '--show-current'], {
        cwd: this.repoPath,
        stdio: ['ignore', 'pipe', 'ignore']
      });
      return result.status === 0 ? result.stdout.toString().trim() : 'unknown';
    } catch {
      return 'unknown';
    }
  }
}

export { GitService };
