import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { logger } from '../../src/utils/logger.js';

describe('CLI Logger', () => {
  let consoleOutput = [];

  beforeEach(() => {
    consoleOutput = [];
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      consoleOutput.push(args.join(' '));
      originalLog.apply(console, args);
    };
    
    console.error = (...args) => {
      consoleOutput.push(args.join(' '));
      originalError.apply(console, args);
    };
  });

  afterEach(() => {
    console.log = console.log;
    console.error = console.error;
  });

  describe('JSON Lines Format', () => {
    test('should output valid JSON for info message', () => {
      logger.info('Test info message');
      
      expect(consoleOutput.length).toBeGreaterThan(0);
      const logLine = consoleOutput[0];
      const parsed = JSON.parse(logLine);
      
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed.level).toBe('INFO');
      expect(parsed.message).toBe('Test info message');
      expect(parsed).toHaveProperty('pid');
    });

    test('should output valid JSON for error message', () => {
      logger.error('Test error message');
      
      expect(consoleOutput.length).toBeGreaterThan(0);
      const logLine = consoleOutput[0];
      const parsed = JSON.parse(logLine);
      
      expect(parsed.level).toBe('ERROR');
      expect(parsed.message).toBe('Test error message');
    });

    test('should output valid JSON for warn message', () => {
      logger.warn('Test warning message');
      
      expect(consoleOutput.length).toBeGreaterThan(0);
      const logLine = consoleOutput[0];
      const parsed = JSON.parse(logLine);
      
      expect(parsed.level).toBe('WARN');
      expect(parsed.message).toBe('Test warning message');
    });

    test('should include extra fields', () => {
      logger.info('Message with extra', { key: 'value', number: 123 });
      
      const logLine = consoleOutput[0];
      const parsed = JSON.parse(logLine);
      
      expect(parsed.key).toBe('value');
      expect(parsed.number).toBe(123);
    });

    test('should have ISO 8601 timestamp', () => {
      logger.info('Check timestamp');
      
      const logLine = consoleOutput[0];
      const parsed = JSON.parse(logLine);
      
      const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
      expect(parsed.timestamp).toMatch(timestampRegex);
    });
  });

  describe('Success/Failure Messages', () => {
    test('should output success message with checkmark', () => {
      const originalLog = console.log;
      let capturedMessage = '';
      
      console.log = (msg) => {
        capturedMessage = msg;
        originalLog(msg);
      };
      
      logger.success('Operation successful');
      
      expect(capturedMessage).toContain('✅');
      expect(capturedMessage).toContain('Operation successful');
      
      console.log = originalLog;
    });

    test('should output failure message with crossmark', () => {
      const originalError = console.error;
      let capturedMessage = '';
      
      console.error = (msg) => {
        capturedMessage = msg;
        originalError(msg);
      };
      
      logger.failure('Operation failed');
      
      expect(capturedMessage).toContain('❌');
      expect(capturedMessage).toContain('Operation failed');
      
      console.error = originalError;
    });
  });
});