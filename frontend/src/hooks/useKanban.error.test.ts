import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useKanban } from './useKanban';
import * as api from '../services/api';
import { CardStatus } from '../types';
import { ToastProvider } from '../context/ToastContext';
import { RequestError } from '../services/errorHandler';
import type { ApiError } from '../services/errorHandler';

vi.mock('../services/api');

describe('useKanban - Error Handling', () => {
  const mockCards = [
    { id: '1', title: 'Test Card', content: 'Desc', status: CardStatus.DONE, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (api.getCards as vi.Mock).mockResolvedValue(mockCards);
  });

  test('handles business rule violation error without blocking', async () => {
    const businessRuleError: ApiError = {
      code: 'BUSINESS_RULE_VIOLATION',
      message: 'Cannot transition from DONE to REJECTED',
      details: {
        field: 'status',
        reason: 'valid transitions from DONE: IN_PROGRESS'
      }
    };
    (api.updateCard as vi.Mock).mockRejectedValue(new RequestError(businessRuleError));

    const { result } = renderHook(() => useKanban(), {
      wrapper: ToastProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let errorHandled = false;
    await act(async () => {
      const updateResult = await result.current.updateCardStatus('1', CardStatus.REJECTED);
      errorHandled = updateResult === undefined;
    });

    expect(errorHandled).toBe(true);
    expect(result.current.cards).toEqual(mockCards);
  });

  test('handles network error gracefully', async () => {
    const networkError: ApiError = {
      code: 'INTERNAL_ERROR',
      message: 'Network error'
    };
    (api.updateCard as vi.Mock).mockRejectedValue(new RequestError(networkError));

    const { result } = renderHook(() => useKanban(), {
      wrapper: ToastProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let errorHandled = false;
    await act(async () => {
      const updateResult = await result.current.updateCardStatus('1', CardStatus.TODO);
      errorHandled = updateResult === undefined;
    });

    expect(errorHandled).toBe(true);
  });

  test('handles validation error without blocking', async () => {
    const validationError: ApiError = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid card data',
      details: {
        field: 'title',
        reason: 'title is required'
      }
    };
    (api.updateCard as vi.Mock).mockRejectedValue(new RequestError(validationError));

    const { result } = renderHook(() => useKanban(), {
      wrapper: ToastProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let errorHandled = false;
    await act(async () => {
      const updateResult = await result.current.updateCardStatus('1', CardStatus.TODO);
      errorHandled = updateResult === undefined;
    });

    expect(errorHandled).toBe(true);
  });
});