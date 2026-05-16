import { describe, test, expect } from "vitest";
import {
  errorMappings,
  statusCodeMapping,
  extractApiError,
  getErrorMessage,
  RequestError,
  type ApiError,
  type ErrorCode,
} from "./errorHandler";

describe("errorHandler", () => {
  describe("errorMappings", () => {
    test("maps all error codes to user-friendly messages", () => {
      expect(errorMappings["VALIDATION_ERROR"].userMessage).toBe(
        "数据验证失败，请检查输入内容",
      );
      expect(errorMappings["NOT_FOUND"].userMessage).toBe("资源未找到");
      expect(errorMappings["BUSINESS_RULE_VIOLATION"].userMessage).toBe(
        "业务规则冲突",
      );
      expect(errorMappings["INTERNAL_ERROR"].userMessage).toBe(
        "服务器内部错误，请稍后重试",
      );
      expect(errorMappings["UNAUTHORIZED"].userMessage).toBe(
        "未授权访问，请重新登录",
      );
      expect(errorMappings["NETWORK_ERROR"].userMessage).toBe(
        "网络连接失败，请检查网络设置",
      );
      expect(errorMappings["TIMEOUT_ERROR"].userMessage).toBe(
        "请求超时，请稍后重试",
      );
      expect(errorMappings["PARSE_ERROR"].userMessage).toBe("数据解析失败");
    });

    test("has correct severity levels", () => {
      expect(errorMappings["INTERNAL_ERROR"].severity).toBe("high");
      expect(errorMappings["UNAUTHORIZED"].severity).toBe("high");
      expect(errorMappings["NETWORK_ERROR"].severity).toBe("high");
      expect(errorMappings["PARSE_ERROR"].severity).toBe("high");
      expect(errorMappings["VALIDATION_ERROR"].severity).toBe("medium");
      expect(errorMappings["NOT_FOUND"].severity).toBe("medium");
      expect(errorMappings["BUSINESS_RULE_VIOLATION"].severity).toBe("medium");
      expect(errorMappings["TIMEOUT_ERROR"].severity).toBe("medium");
    });
  });

  describe("statusCodeMapping", () => {
    test("maps HTTP status codes to error codes", () => {
      expect(statusCodeMapping[400]).toBe("VALIDATION_ERROR");
      expect(statusCodeMapping[401]).toBe("UNAUTHORIZED");
      expect(statusCodeMapping[403]).toBe("UNAUTHORIZED");
      expect(statusCodeMapping[404]).toBe("NOT_FOUND");
      expect(statusCodeMapping[409]).toBe("BUSINESS_RULE_VIOLATION");
      expect(statusCodeMapping[422]).toBe("VALIDATION_ERROR");
      expect(statusCodeMapping[500]).toBe("INTERNAL_ERROR");
      expect(statusCodeMapping[504]).toBe("TIMEOUT_ERROR");
    });
  });

  describe("extractApiError", () => {
    test("extracts error from JSON response", async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: { field: "title", reason: "cannot be empty" },
        }),
      };
      const result = await extractApiError(mockResponse as unknown as Response);
      expect(result.code).toBe("VALIDATION_ERROR");
      expect(result.message).toBe("Validation failed");
      expect(result.details?.field).toBe("title");
    });

    test("falls back to status code mapping when JSON parsing fails", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      };
      const result = await extractApiError(mockResponse as unknown as Response);
      expect(result.code).toBe("NOT_FOUND");
      expect(result.message).toBe("HTTP 404 Error");
    });

    test("uses INTERNAL_ERROR for unknown status codes", async () => {
      const mockResponse = {
        ok: false,
        status: 418,
        json: async () => ({}),
      };
      const result = await extractApiError(mockResponse as unknown as Response);
      expect(result.code).toBe("INTERNAL_ERROR");
    });

    test("includes timestamp in response", async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({ code: "VALIDATION_ERROR", message: "Error" }),
      };
      const result = await extractApiError(mockResponse as unknown as Response);
      expect(result.timestamp).toBeDefined();
    });
  });

  describe("getErrorMessage", () => {
    test("returns mapped message without details", () => {
      const error: ApiError = { code: "NOT_FOUND", message: "Not found" };
      expect(getErrorMessage(error)).toBe("资源未找到");
    });

    test("returns mapped message with reason details", () => {
      const error: ApiError = {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: { reason: "title is required" },
      };
      expect(getErrorMessage(error)).toBe(
        "数据验证失败，请检查输入内容: title is required",
      );
    });

    test("returns mapped message with field details", () => {
      const error: ApiError = {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: { field: "email" },
      };
      expect(getErrorMessage(error)).toBe(
        "数据验证失败，请检查输入内容（字段: email）",
      );
    });

    test("returns message for unknown error code", () => {
      const error: ApiError = {
        code: "UNKNOWN_ERROR" as unknown as ErrorCode,
        message: "Unknown error",
      };
      expect(getErrorMessage(error)).toBe("Unknown error");
    });
  });

  describe("RequestError", () => {
    test("creates RequestError with apiError", () => {
      const apiError: ApiError = {
        code: "INTERNAL_ERROR",
        message: "Internal error",
      };
      const error = new RequestError(apiError);
      expect(error.name).toBe("RequestError");
      expect(error.message).toBe("Internal error");
      expect(error.apiError).toEqual(apiError);
    });

    test("creates RequestError with httpInfo", () => {
      const apiError: ApiError = { code: "NOT_FOUND", message: "Not found" };
      const httpInfo = {
        status: 404,
        statusText: "Not Found",
        url: "/api/test",
      };
      const error = new RequestError(apiError, httpInfo);
      expect(error.httpInfo).toEqual(httpInfo);
    });
  });
});
