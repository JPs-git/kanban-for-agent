import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';

class BuildService {
  constructor() {
    this.repoPath = config.repoPath;
  }

  isNodeAvailable() {
    try {
      const result = spawnSync('node', ['--version'], {
        stdio: ['ignore', 'pipe', 'ignore']
      });
      if (result.status === 0) {
        logger.debug(`Node.js version: ${result.stdout.toString().trim()}`);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  isNpmAvailable() {
    try {
      const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      const result = spawnSync(npmCmd, ['--version'], {
        stdio: ['ignore', 'pipe', 'ignore'],
        shell: process.platform === 'win32'
      });
      if (result.status === 0) {
        logger.debug(`npm version: ${result.stdout.toString().trim()}`);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  checkPrerequisites() {
    if (!this.isNodeAvailable()) {
      logger.error('Node.js is not installed or not found in PATH');
      return false;
    }
    if (!this.isNpmAvailable()) {
      logger.error('npm is not installed or not found in PATH');
      return false;
    }
    return true;
  }

  installDependencies() {
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    logger.info('Installing dependencies...');

    try {
      const result = spawnSync(npmCmd, ['run', 'install'], {
        cwd: this.repoPath,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: process.platform === 'win32'
      });

      if (result.status !== 0) {
        logger.error(`npm run install failed: ${result.stderr.toString()}`);
        return false;
      }
      logger.info('Dependencies installed successfully');
      return true;
    } catch (err) {
      logger.error(`Failed to install dependencies: ${err.message}`);
      return false;
    }
  }

  runBuild() {
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    logger.info('Building project...');

    try {
      const result = spawnSync(npmCmd, ['run', 'build'], {
        cwd: this.repoPath,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: process.platform === 'win32'
      });

      if (result.status !== 0) {
        logger.error(`Build failed: ${result.stderr.toString()}`);
        return false;
      }
      logger.info('Build completed successfully');
      return true;
    } catch (err) {
      logger.error(`Failed to build project: ${err.message}`);
      return false;
    }
  }

  copyFrontend() {
    const frontendDist = path.join(this.repoPath, 'frontend', 'dist');
    const backendPublic = path.join(this.repoPath, 'backend', 'dist', 'public');

    logger.info('Copying frontend build files to backend...');

    if (fs.existsSync(frontendDist)) {
      if (fs.existsSync(backendPublic)) {
        this.deleteDir(backendPublic);
      }
      this.copyDir(frontendDist, backendPublic);
      logger.info(`Frontend files copied to ${backendPublic}`);
      return true;
    } else {
      logger.error('Frontend dist directory not found');
      return false;
    }
  }

  deleteDir(dir) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const curPath = path.join(dir, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          this.deleteDir(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      }
      fs.rmdirSync(dir);
    }
  }

  copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(src);
    for (const file of files) {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);

      if (fs.lstatSync(srcPath).isDirectory()) {
        this.copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  fullBuild() {
    if (!this.checkPrerequisites()) {
      return false;
    }

    if (!this.installDependencies()) {
      return false;
    }

    if (!this.runBuild()) {
      return false;
    }

    if (!this.copyFrontend()) {
      return false;
    }

    logger.info('Full build completed successfully!');
    return true;
  }
}

export { BuildService };