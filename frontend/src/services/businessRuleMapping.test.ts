import { describe, test, expect } from "vitest";
import {
  errorMappings,
  getBusinessRuleMessage,
  type ApiError,
  type BusinessRuleCode,
} from "./errorHandler";

describe("Business Rule Error Mapping", () => {
  describe("getBusinessRuleMessage", () => {
    test("maps CARD_NOT_TRANSITIONABLE_TO_REJECTED rule code to friendly message", () => {
      const error: ApiError = {
        code: "BUSINESS_RULE_VIOLATION",
        message: "Cannot transition from DONE to REJECTED",
        details: {
          field: "status",
          reason: "valid transitions from DONE: IN_PROGRESS",
          ruleCode: "CARD_NOT_TRANSITIONABLE_TO_REJECTED" as BusinessRuleCode,
        },
      };
      expect(getBusinessRuleMessage(error)).toBe("已完成的任务不能拒绝!");
    });

    test("returns base message for unknown business rule errors without ruleCode", () => {
      const error: ApiError = {
        code: "BUSINESS_RULE_VIOLATION",
        message: "Some unknown business rule violation",
      };
      expect(getBusinessRuleMessage(error)).toBe("业务规则冲突");
    });

    test("maps CARD_MUST_BE_STARTED_BEFORE_COMPLETION rule code to friendly message", () => {
      const error: ApiError = {
        code: "BUSINESS_RULE_VIOLATION",
        message: "Cannot transition from TODO to DONE",
        details: {
          reason: "tasks must be started before completion",
          ruleCode:
            "CARD_MUST_BE_STARTED_BEFORE_COMPLETION" as BusinessRuleCode,
        },
      };
      expect(getBusinessRuleMessage(error)).toBe("任务必须先开始才能完成");
    });

    test("maps CARD_CANNOT_BE_REOPENED rule code to friendly message", () => {
      const error: ApiError = {
        code: "BUSINESS_RULE_VIOLATION",
        message: "Cannot transition from IN_PROGRESS to TODO",
        details: {
          reason: "cannot reopen started tasks",
          ruleCode: "CARD_CANNOT_BE_REOPENED" as BusinessRuleCode,
        },
      };
      expect(getBusinessRuleMessage(error)).toBe("已开始的任务不能重新打开");
    });

    test("maps INVALID_STATUS_TRANSITION rule code to friendly message", () => {
      const error: ApiError = {
        code: "BUSINESS_RULE_VIOLATION",
        message: "Some invalid transition",
        details: {
          ruleCode: "INVALID_STATUS_TRANSITION" as BusinessRuleCode,
        },
      };
      expect(getBusinessRuleMessage(error)).toBe("状态转换不合法");
    });

    test("includes reason when ruleCode is not in mappings", () => {
      const error: ApiError = {
        code: "BUSINESS_RULE_VIOLATION",
        message: "Some invalid transition",
        details: {
          reason: "some technical reason",
          ruleCode: "UNKNOWN_RULE_CODE" as BusinessRuleCode,
        },
      };
      expect(getBusinessRuleMessage(error)).toBe(
        "业务规则冲突 (some technical reason)",
      );
    });
  });

  describe("errorMappings severity for BUSINESS_RULE_VIOLATION", () => {
    test("should have medium severity for business rule violations", () => {
      expect(errorMappings["BUSINESS_RULE_VIOLATION"].severity).toBe("medium");
    });
  });
});
