import { jest } from '@jest/globals';

export const mockLogger = {
  success: jest.fn(),
  failure: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

export const logger = mockLogger;