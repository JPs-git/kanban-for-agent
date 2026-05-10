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
      const result = spawnSync('npm', ['--version'], {
        stdio: ['ignore', 'pipe', 'ignore']
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

  installBackendDeps() {
    const backendPath = path.join(this.repoPath, 'backend');
    logger.info('Installing backend dependencies...');

    try {
      const result = spawnSync('npm', ['install'], {
        cwd: backendPath,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      if (result.status !== 0) {
        logger.error(`npm install failed: ${result.stderr.toString()}`);
        return false;
      }
      logger.info('Backend dependencies installed successfully');
      return true;
    } catch (err) {
      logger.error(`Failed to install backend dependencies: ${err.message}`);
      return false;
    }
  }

  buildBackend() {
    const backendPath = path.join(this.repoPath, 'backend');
    logger.info('Building backend...');

    try {
      const result = spawnSync('npm', ['run', 'build'], {
        cwd: backendPath,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      if (result.status !== 0) {
        logger.error(`Backend build failed: ${result.stderr.toString()}`);
        return false;
      }
      logger.info('Backend built successfully');
      return true;
    } catch (err) {
      logger.error(`Failed to build backend: ${err.message}`);
      return false;
    }
  }

  installFrontendDeps() {
    const frontendPath = path.join(this.repoPath, 'frontend');
    logger.info('Installing frontend dependencies...');

    try {
      const result = spawnSync('npm', ['install'], {
        cwd: frontendPath,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      if (result.status !== 0) {
        logger.error(`Frontend npm install failed: ${result.stderr.toString()}`);
        return false;
      }
      logger.info('Frontend dependencies installed successfully');
      return true;
    } catch (err) {
      logger.error(`Failed to install frontend dependencies: ${err.message}`);
      return false;
    }
  }

  buildFrontend() {
    const frontendPath = path.join(this.repoPath, 'frontend');
    const publicPath = path.join(this.repoPath, 'backend', 'dist', 'public');

    logger.info('Building frontend...');

    try {
      const result = spawnSync('npm', ['run', 'build'], {
        cwd: frontendPath,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      if (result.status !== 0) {
        logger.error(`Frontend build failed: ${result.stderr.toString()}`);
        return false;
      }

      const distPath = path.join(frontendPath, 'dist');
      if (fs.existsSync(distPath)) {
        const publicDir = path.dirname(publicPath);
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        
        if (fs.existsSync(publicPath)) {
          this.deleteDir(publicPath);
        }
        
        this.copyDir(distPath, publicPath);
        logger.info(`Frontend files copied to ${publicPath}`);
      } else {
        logger.error('Frontend dist directory not found after build');
        return false;
      }

      logger.info('Frontend built and deployed successfully');
      return true;

    } catch (err) {
      logger.error(`Failed to build frontend: ${err.message}`);
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

    if (!this.installBackendDeps()) {
      return false;
    }

    if (!this.buildBackend()) {
      return false;
    }

    if (!this.installFrontendDeps()) {
      return false;
    }

    if (!this.buildFrontend()) {
      return false;
    }

    logger.info('Full build completed successfully!');
    return true;
  }
}

export { BuildService };
