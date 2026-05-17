import { describe, test, expect } from "vitest";
import {
  extractApiError,
  getErrorMessage,
  type ApiError,
} from "./errorHandler";

describe("extractApiError with nested error format", () => {
  test("extracts error from nested error response (backend format)", async () => {
    const mockResponse = {
      ok: false,
      status: 409,
      json: async () => ({
        error: {
          code: "BUSINESS_RULE_VIOLATION",
          message: "Cannot transition from DONE to REJECTED",
          details: {
            field: "status",
            reason: "valid transitions from DONE: IN_PROGRESS",
            ruleCode: "CARD_NOT_TRANSITIONABLE_TO_REJECTED",
          },
          timestamp: "2026-05-15T11:55:34.678Z",
        },
      }),
    };
    const result = await extractApiError(mockResponse as unknown as Response);
    expect(result.code).toBe("BUSINESS_RULE_VIOLATION");
    expect(result.message).toBe("Cannot transition from DONE to REJECTED");
    expect(result.details?.field).toBe("status");
    expect(result.details?.reason).toBe(
      "valid transitions from DONE: IN_PROGRESS",
    );
    expect(result.details?.ruleCode).toBe(
      "CARD_NOT_TRANSITIONABLE_TO_REJECTED",
    );
  });

  test("extracts error from flat error response (alternative format)", async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      json: async () => ({
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: { field: "title" },
      }),
    };
    const result = await extractApiError(mockResponse as unknown as Response);
    expect(result.code).toBe("VALIDATION_ERROR");
    expect(result.message).toBe("Validation failed");
  });

  test("getErrorMessage returns friendly message for BUSINESS_RULE_VIOLATION with ruleCode", () => {
    const error: ApiError = {
      code: "BUSINESS_RULE_VIOLATION",
      message: "Cannot transition from DONE to REJECTED",
      details: {
        field: "status",
        reason: "valid transitions from DONE: IN_PROGRESS",
        ruleCode: "CARD_NOT_TRANSITIONABLE_TO_REJECTED",
      },
    };
    expect(getErrorMessage(error)).toBe("已完成的任务不能拒绝!");
  });
});
