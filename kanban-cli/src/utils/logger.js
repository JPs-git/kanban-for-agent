import fs from 'fs';
import path from 'path';
import { config } from './config.js';

class Logger {
  constructor() {
    this.logFile = null;
  }

  setupFileLogger() {
    const logDir = config.logsPath;
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    this.logFile = path.join(logDir, 'cli.log');
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](logMessage);
    
    if (this.logFile) {
      fs.appendFileSync(this.logFile, logMessage + '\n');
    }
  }

  debug(message) {
    this.log('debug', message);
  }

  info(message) {
    this.log('info', message);
  }

  warn(message) {
    this.log('warn', message);
  }

  error(message) {
    this.log('error', message);
  }

  success(message) {
    console.log(`\u2705 ${message}`);
  }

  failure(message) {
    console.error(`\u274C ${message}`);
  }
}

export const logger = new Logger();
