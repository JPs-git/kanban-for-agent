import { describe, test, expect } from '@jest/globals';
import { getParam, getQueryParam, validateRequiredFields } from '../../src/utils/request';
import type { Request } from 'express';

describe('getParam', () => {
  test('should return param value when present', () => {
    const req = { params: { id: 'test-id' } } as Request;
    const result = getParam(req, 'id');
    expect(result).toBe('test-id');
  });

  test('should return undefined when param is missing', () => {
    const req = { params: {} } as Request;
    const result = getParam(req, 'id');
    expect(result).toBeUndefined();
  });

  test('should return default value when param is missing', () => {
    const req = { params: {} } as Request;
    const result = getParam(req, 'id', 'default');
    expect(result).toBe('default');
  });

  test('should return default value when param is empty string', () => {
    const req = { params: { id: '' } } as Request;
    const result = getParam(req, 'id', 'default');
    expect(result).toBe('');
  });
});

describe('getQueryParam', () => {
  test('should return query param value when present', () => {
    const req = { query: { page: '1', limit: '10' } } as Request;
    const result = getQueryParam(req, 'page');
    expect(result).toBe('1');
  });

  test('should return undefined when query param is missing', () => {
    const req = { query: {} } as Request;
    const result = getQueryParam(req, 'page');
    expect(result).toBeUndefined();
  });

  test('should return default value when query param is missing', () => {
    const req = { query: {} } as Request;
    const result = getQueryParam(req, 'page', '1');
    expect(result).toBe('1');
  });

  test('should parse number values correctly', () => {
    const req = { query: { page: '10', limit: '20' } } as Request;
    const page = parseInt(getQueryParam(req, 'page') || '1', 10);
    const limit = parseInt(getQueryParam(req, 'limit') || '10', 10);
    expect(page).toBe(10);
    expect(limit).toBe(20);
  });
});

describe('validateRequiredFields', () => {
  test('should return empty array when all required fields are present', () => {
    const body = { title: 'Test', content: 'Content' };
    const missing = validateRequiredFields(body, ['title', 'content']);
    expect(missing).toEqual([]);
  });

  test('should return missing fields array when fields are missing', () => {
    const body = { title: 'Test' };
    const missing = validateRequiredFields(body, ['title', 'content']);
    expect(missing).toEqual(['content']);
  });

  test('should return multiple missing fields', () => {
    const body = {};
    const missing = validateRequiredFields(body, ['title', 'content', 'status']);
    expect(missing).toEqual(['title', 'content', 'status']);
  });

  test('should treat empty string as present', () => {
    const body = { title: '' };
    const missing = validateRequiredFields(body, ['title']);
    expect(missing).toEqual([]);
  });

  test('should treat null as missing', () => {
    const body = { title: null };
    const missing = validateRequiredFields(body, ['title']);
    expect(missing).toEqual(['title']);
  });

  test('should treat undefined as missing', () => {
    const body = { title: undefined };
    const missing = validateRequiredFields(body, ['title']);
    expect(missing).toEqual(['title']);
  });
});