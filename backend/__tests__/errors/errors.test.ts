import { describe, test, expect } from '@jest/globals';
import { AppError, ValidationError, NotFoundError, BusinessRuleError, UnauthorizedError, InternalError } from '../../src/errors';

describe('AppError', () => {
  test('should have default properties', () => {
    const error = new AppError('Test error', 'TEST_ERROR', 500);
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.httpStatus).toBe(500);
    expect(error.details).toBeUndefined();
    expect(error.timestamp).toBeDefined();
    expect(error.stack).toBeDefined();
  });

  test('should include details when provided', () => {
    const details = { field: 'title', reason: 'is required' };
    const error = new AppError('Test error', 'TEST_ERROR', 400, details);
    expect(error.details).toEqual(details);
  });

  test('should serialize to JSON correctly', () => {
    const error = new AppError('Test error', 'TEST_ERROR', 500);
    const json = error.toJSON();
    expect(json.message).toBe('Test error');
    expect(json.code).toBe('TEST_ERROR');
    expect(json.timestamp).toBeDefined();
    expect(json.details).toBeUndefined();
  });

  test('should include details in JSON when provided', () => {
    const details = { field: 'title', reason: 'is required' };
    const error = new AppError('Test error', 'TEST_ERROR', 400, details);
    const json = error.toJSON();
    expect(json.details).toEqual(details);
  });
});

describe('ValidationError', () => {
  test('should have correct code and status', () => {
    const error = new ValidationError('Validation failed');
    expect(error.message).toBe('Validation failed');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.httpStatus).toBe(400);
  });

  test('should be instance of AppError', () => {
    const error = new ValidationError('Validation failed');
    expect(error).toBeInstanceOf(AppError);
  });

  test('should accept details', () => {
    const details = { field: 'email', reason: 'invalid format' };
    const error = new ValidationError('Invalid email', details);
    expect(error.details).toEqual(details);
  });
});

describe('NotFoundError', () => {
  test('should have correct code and status', () => {
    const error = new NotFoundError('Not found');
    expect(error.message).toBe('Not found');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.httpStatus).toBe(404);
  });

  test('should be instance of AppError', () => {
    const error = new NotFoundError('Not found');
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('BusinessRuleError', () => {
  test('should have correct code and status', () => {
    const error = new BusinessRuleError('Rule violated');
    expect(error.message).toBe('Rule violated');
    expect(error.code).toBe('BUSINESS_RULE_VIOLATION');
    expect(error.httpStatus).toBe(400);
  });

  test('should be instance of AppError', () => {
    const error = new BusinessRuleError('Rule violated');
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('UnauthorizedError', () => {
  test('should have correct code and status', () => {
    const error = new UnauthorizedError('Unauthorized');
    expect(error.message).toBe('Unauthorized');
    expect(error.code).toBe('UNAUTHORIZED');
    expect(error.httpStatus).toBe(401);
  });

  test('should be instance of AppError', () => {
    const error = new UnauthorizedError('Unauthorized');
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('InternalError', () => {
  test('should have correct code and status', () => {
    const error = new InternalError();
    expect(error.message).toBe('Internal server error');
    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.httpStatus).toBe(500);
  });

  test('should accept custom message', () => {
    const error = new InternalError('Custom error');
    expect(error.message).toBe('Custom error');
  });

  test('should be instance of AppError', () => {
    const error = new InternalError();
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('Error Hierarchy', () => {
  test('all error classes should extend AppError', () => {
    expect(new ValidationError('test')).toBeInstanceOf(AppError);
    expect(new NotFoundError('test')).toBeInstanceOf(AppError);
    expect(new BusinessRuleError('test')).toBeInstanceOf(AppError);
    expect(new UnauthorizedError('test')).toBeInstanceOf(AppError);
    expect(new InternalError()).toBeInstanceOf(AppError);
  });
});