import { describe, test, expect } from "vitest";
import {
  getBusinessRuleMessage,
  type ApiError,
  type BusinessRuleCode,
} from "./errorHandler";

describe("Business Rule Error Mapping - RuleCode Priority", () => {
  describe("getBusinessRuleMessage", () => {
    test("should NOT include reason when ruleCode has mapping", () => {
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

    test("should include reason when ruleCode does NOT have mapping", () => {
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

    test("should include reason when ruleCode is not provided", () => {
      const error: ApiError = {
        code: "BUSINESS_RULE_VIOLATION",
        message: "Some business rule violation",
        details: {
          reason: "some technical reason",
        },
      };
      expect(getBusinessRuleMessage(error)).toBe(
        "业务规则冲突 (some technical reason)",
      );
    });

    test("should NOT include reason for CARD_MUST_BE_STARTED_BEFORE_COMPLETION", () => {
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

    test("should NOT include reason for CARD_CANNOT_BE_REOPENED", () => {
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

    test("should NOT include reason for INVALID_STATUS_TRANSITION", () => {
      const error: ApiError = {
        code: "BUSINESS_RULE_VIOLATION",
        message: "Some invalid transition",
        details: {
          reason: "some technical reason",
          ruleCode: "INVALID_STATUS_TRANSITION" as BusinessRuleCode,
        },
      };
      expect(getBusinessRuleMessage(error)).toBe("状态转换不合法");
    });
  });
});
