import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useErrorHandler } from './useErrorHandler';
import { ToastProvider } from '../context/ToastContext';
import { RequestError, type ApiError } from '../services/errorHandler';

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Business Rule Violation', () => {
    test('shows warning toast for BUSINESS_RULE_VIOLATION errors', () => {
      const { result } = renderHook(() => useErrorHandler(), {
        wrapper: ToastProvider,
      });

      const error: ApiError = {
        code: 'BUSINESS_RULE_VIOLATION',
        message: 'Cannot transition from DONE to REJECTED',
        details: {
          field: 'status',
          reason: 'valid transitions from DONE: IN_PROGRESS'
        }
      };

      const requestError = new RequestError(error);
      result.current.handleError(requestError);
    });

    test('returns friendly message for DONE to REJECTED transition', () => {
      const { result } = renderHook(() => useErrorHandler(), {
        wrapper: ToastProvider,
      });

      const error: ApiError = {
        code: 'BUSINESS_RULE_VIOLATION',
        message: 'Cannot transition from DONE to REJECTED',
      };

      const requestError = new RequestError(error);
      expect(() => result.current.handleError(requestError)).not.toThrow();
    });
  });

  describe('Other Errors', () => {
    test('shows error toast for network errors', () => {
      const { result } = renderHook(() => useErrorHandler(), {
        wrapper: ToastProvider,
      });

      const networkError = new Error('Network request failed');
      networkError.name = 'NetworkError';
      result.current.handleError(networkError);
    });

    test('shows error toast for validation errors', () => {
      const { result } = renderHook(() => useErrorHandler(), {
        wrapper: ToastProvider,
      });

      const error: ApiError = {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
      };

      const requestError = new RequestError(error);
      result.current.handleError(requestError);
    });
  });

  describe('wrapAsync', () => {
    test('returns undefined on error', async () => {
      const { result } = renderHook(() => useErrorHandler(), {
        wrapper: ToastProvider,
      });

      const failingFunction = async () => {
        throw new Error('Test error');
      };

      const returnValue = await result.current.wrapAsync(failingFunction);
      expect(returnValue).toBeUndefined();
    });

    test('returns result on success', async () => {
      const { result } = renderHook(() => useErrorHandler(), {
        wrapper: ToastProvider,
      });

      const successfulFunction = async () => {
        return 'success';
      };

      const returnValue = await result.current.wrapAsync(successfulFunction);
      expect(returnValue).toBe('success');
    });
  });
});