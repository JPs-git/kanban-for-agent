import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  event?: string;
  message: string;
  pid: number;
  env: string;
  stack?: string;
  [key: string]: unknown;
}

export class Logger {
  private logFile: fs.WriteStream | null = null;
  private logLevel: LogLevel;

  constructor() {
    this.logLevel = process.env.LOG_LEVEL as LogLevel || 'INFO';
    this.setupFileLogger();
    this.setupProcessHandlers();
  }

  private setupFileLogger(): void {
    const logsDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const logFilePath = path.join(logsDir, 'backend.log');
    this.logFile = fs.createWriteStream(logFilePath, { flags: 'a' });
  }

  private setupProcessHandlers(): void {
    process.on('uncaughtException', (err) => {
      this.error('PROCESS_UNCAUGHT_EXCEPTION', err.message, {
        stack: err.stack,
        code: (err as NodeJS.ErrnoException).code
      });
      setTimeout(() => process.exit(1), 100);
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.error('PROCESS_UNHANDLED_REJECTION', String(reason), {
        promise: promise.toString()
      });
    });

    process.on('SIGTERM', () => {
      this.info('PROCESS_SIGTERM', 'Received SIGTERM, shutting down gracefully');
      this.close();
    });

    process.on('SIGINT', () => {
      this.info('PROCESS_SIGINT', 'Received SIGINT, shutting down gracefully');
      this.close();
    });

    process.on('exit', (code) => {
      this.info('PROCESS_EXIT', `Process exiting with code ${code}`, { exitCode: code });
      this.close();
    });
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private formatEntry(
    level: LogLevel,
    event: string | undefined,
    message: string,
    extra?: Record<string, unknown>
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      pid: process.pid,
      env: process.env.NODE_ENV || 'development',
      ...extra
    };

    if (event) {
      entry.event = event;
    }

    return entry;
  }

  private log(level: LogLevel, event: string | undefined, message: string, extra?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;

    const entry = this.formatEntry(level, event, message, extra);
    const jsonLine = JSON.stringify(entry) + '\n';

    if (level === 'ERROR') {
      console.error(jsonLine);
    } else {
      console.log(jsonLine);
    }

    if (this.logFile) {
      this.logFile.write(jsonLine);
    }
  }

  debug(message: string, extra?: Record<string, unknown>): void;
  debug(event: string, message: string, extra?: Record<string, unknown>): void;
  debug(eventOrMessage: string, messageOrExtra?: string | Record<string, unknown>, extra?: Record<string, unknown>): void {
    if (typeof messageOrExtra === 'string') {
      this.log('DEBUG', eventOrMessage, messageOrExtra, extra);
    } else {
      this.log('DEBUG', undefined, eventOrMessage, messageOrExtra);
    }
  }

  info(message: string, extra?: Record<string, unknown>): void;
  info(event: string, message: string, extra?: Record<string, unknown>): void;
  info(eventOrMessage: string, messageOrExtra?: string | Record<string, unknown>, extra?: Record<string, unknown>): void {
    if (typeof messageOrExtra === 'string') {
      this.log('INFO', eventOrMessage, messageOrExtra, extra);
    } else {
      this.log('INFO', undefined, eventOrMessage, messageOrExtra);
    }
  }

  warn(message: string, extra?: Record<string, unknown>): void;
  warn(event: string, message: string, extra?: Record<string, unknown>): void;
  warn(eventOrMessage: string, messageOrExtra?: string | Record<string, unknown>, extra?: Record<string, unknown>): void {
    if (typeof messageOrExtra === 'string') {
      this.log('WARN', eventOrMessage, messageOrExtra, extra);
    } else {
      this.log('WARN', undefined, eventOrMessage, messageOrExtra);
    }
  }

  error(message: string, extra?: Record<string, unknown>): void;
  error(event: string, message: string, extra?: Record<string, unknown>): void;
  error(eventOrMessage: string, messageOrExtra?: string | Record<string, unknown>, extra?: Record<string, unknown>): void {
    if (typeof messageOrExtra === 'string') {
      this.log('ERROR', eventOrMessage, messageOrExtra, extra);
    } else {
      this.log('ERROR', undefined, eventOrMessage, messageOrExtra);
    }
  }

  close(): void {
    if (this.logFile) {
      this.logFile.end();
      this.logFile = null;
    }
  }
}

export const logger = new Logger();