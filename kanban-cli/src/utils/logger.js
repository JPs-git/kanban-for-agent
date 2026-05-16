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

  formatJsonLine(level, message, extra = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      pid: process.pid,
      ...extra
    }) + '\n';
  }

  log(level, message, extra) {
    const jsonLine = this.formatJsonLine(level, message, extra);
    
    if (level === 'error') {
      console.error(jsonLine);
    } else {
      console.log(jsonLine);
    }
    
    if (this.logFile) {
      fs.appendFileSync(this.logFile, jsonLine);
    }
  }

  debug(message, extra) {
    this.log('debug', message, extra);
  }

  info(message, extra) {
    this.log('info', message, extra);
  }

  warn(message, extra) {
    this.log('warn', message, extra);
  }

  error(message, extra) {
    this.log('error', message, extra);
  }

  success(message) {
    console.log(`\u2705 ${message}`);
  }

  failure(message) {
    console.error(`\u274C ${message}`);
  }
}

export const logger = new Logger();