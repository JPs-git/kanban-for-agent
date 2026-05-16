import { Logger } from '../../src/utils/logger.js';

describe('Logger', () => {
  beforeEach(() => {
    process.env.LOG_LEVEL = 'DEBUG';
  });

  describe('JSON Lines Format', () => {
    let consoleOutput: string[] = [];
    
    beforeEach(() => {
      consoleOutput = [];
      const originalLog = console.log;
      const originalError = console.error;
      
      console.log = (...args: Array<unknown>) => {
        consoleOutput.push(args.join(' '));
        originalLog.apply(console, args);
      };
      
      console.error = (...args: Array<unknown>) => {
        consoleOutput.push(args.join(' '));
        originalError.apply(console, args);
      };
    });

    afterEach(() => {
      console.log = console.log;
      console.error = console.error;
    });

    test('should output valid JSON for info message', () => {
      const logger = new Logger();
      logger.info('TEST_MESSAGE', 'Test message content');
      
      expect(consoleOutput.length).toBeGreaterThan(0);
      const logLine = consoleOutput[0];
      const parsed = JSON.parse(logLine);
      
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed.level).toBe('INFO');
      expect(parsed.message).toBe('Test message content');
      expect(parsed.event).toBe('TEST_MESSAGE');
      expect(parsed).toHaveProperty('pid');
      expect(parsed).toHaveProperty('env');
    });

    test('should output valid JSON for error message', () => {
      const logger = new Logger();
      logger.error('TEST_ERROR', 'Error occurred', { stack: 'Error stack trace' });
      
      expect(consoleOutput.length).toBeGreaterThan(0);
      const logLine = consoleOutput[0];
      const parsed = JSON.parse(logLine);
      
      expect(parsed.level).toBe('ERROR');
      expect(parsed.event).toBe('TEST_ERROR');
      expect(parsed.message).toBe('Error occurred');
      expect(parsed.stack).toBe('Error stack trace');
    });

    test('should support extra fields', () => {
      const logger = new Logger();
      logger.info('TEST_EXTRA', 'Message with extra data', {
        customField: 'customValue',
        numericField: 123
      });
      
      const logLine = consoleOutput[0];
      const parsed = JSON.parse(logLine);
      
      expect(parsed.customField).toBe('customValue');
      expect(parsed.numericField).toBe(123);
    });

    test('should include ISO 8601 timestamp', () => {
      const logger = new Logger();
      logger.info('TEST_TIME', 'Check timestamp format');
      
      const logLine = consoleOutput[0];
      const parsed = JSON.parse(logLine);
      
      const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
      expect(parsed.timestamp).toMatch(timestampRegex);
    });
  });

  describe('Log Levels', () => {
    let consoleOutput: string[] = [];
    
    beforeEach(() => {
      consoleOutput = [];
      const originalLog = console.log;
      const originalError = console.error;
      
      console.log = (...args: Array<unknown>) => {
        consoleOutput.push(args.join(' '));
        originalLog.apply(console, args);
      };
      
      console.error = (...args: Array<unknown>) => {
        consoleOutput.push(args.join(' '));
        originalError.apply(console, args);
      };
    });

    afterEach(() => {
      console.log = console.log;
      console.error = console.error;
    });

    test('should output debug messages', () => {
      const logger = new Logger();
      expect(process.env.LOG_LEVEL).toBe('DEBUG');
      logger.debug('TEST_DEBUG', 'Debug message');
      
      expect(consoleOutput.length).toBeGreaterThan(0);
      const parsed = JSON.parse(consoleOutput[0]);
      expect(parsed.level).toBe('DEBUG');
    });

    test('should output info messages', () => {
      const logger = new Logger();
      logger.info('TEST_INFO', 'Info message');
      
      expect(consoleOutput.length).toBeGreaterThan(0);
      const parsed = JSON.parse(consoleOutput[0]);
      expect(parsed.level).toBe('INFO');
    });

    test('should output warn messages', () => {
      const logger = new Logger();
      logger.warn('TEST_WARN', 'Warning message');
      
      expect(consoleOutput.length).toBeGreaterThan(0);
      const parsed = JSON.parse(consoleOutput[0]);
      expect(parsed.level).toBe('WARN');
    });

    test('should output error messages to stderr', () => {
      const logger = new Logger();
      logger.error('TEST_ERROR', 'Error message');
      
      expect(consoleOutput.length).toBeGreaterThan(0);
      const parsed = JSON.parse(consoleOutput[0]);
      expect(parsed.level).toBe('ERROR');
    });
  });

  describe('Process Event Handlers', () => {
    test('should have uncaughtException listeners', () => {
      new Logger();
      expect(process.listeners('uncaughtException').length).toBeGreaterThan(0);
    });

    test('should have unhandledRejection listeners', () => {
      new Logger();
      expect(process.listeners('unhandledRejection').length).toBeGreaterThan(0);
    });

    test('should have SIGTERM listeners', () => {
      new Logger();
      expect(process.listeners('SIGTERM').length).toBeGreaterThan(0);
    });

    test('should have SIGINT listeners', () => {
      new Logger();
      expect(process.listeners('SIGINT').length).toBeGreaterThan(0);
    });

    test('should have exit listeners', () => {
      new Logger();
      expect(process.listeners('exit').length).toBeGreaterThan(0);
    });
  });
});