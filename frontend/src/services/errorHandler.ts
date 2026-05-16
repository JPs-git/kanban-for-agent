export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "BUSINESS_RULE_VIOLATION"
  | "INTERNAL_ERROR"
  | "UNAUTHORIZED"
  | "NETWORK_ERROR"
  | "TIMEOUT_ERROR"
  | "PARSE_ERROR";

export type BusinessRuleCode =
  | "INVALID_STATUS_TRANSITION"
  | "CARD_NOT_TRANSITIONABLE_TO_REJECTED"
  | "CARD_MUST_BE_STARTED_BEFORE_COMPLETION"
  | "CARD_CANNOT_BE_REOPENED";

export interface ApiErrorDetails {
  field?: string;
  reason?: string;
  ruleCode?: BusinessRuleCode;
  [key: string]: unknown;
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: ApiErrorDetails;
  timestamp?: string;
}

export interface HttpErrorInfo {
  status: number;
  statusText: string;
  url: string;
}

export interface ErrorMapping {
  code: ErrorCode;
  userMessage: string;
  httpStatus?: number;
  severity: "low" | "medium" | "high";
}

export const errorMappings: Record<ErrorCode, ErrorMapping> = {
  VALIDATION_ERROR: {
    code: "VALIDATION_ERROR",
    userMessage: "数据验证失败，请检查输入内容",
    httpStatus: 400,
    severity: "medium",
  },
  NOT_FOUND: {
    code: "NOT_FOUND",
    userMessage: "资源未找到",
    httpStatus: 404,
    severity: "medium",
  },
  BUSINESS_RULE_VIOLATION: {
    code: "BUSINESS_RULE_VIOLATION",
    userMessage: "业务规则冲突",
    httpStatus: 409,
    severity: "medium",
  },
  INTERNAL_ERROR: {
    code: "INTERNAL_ERROR",
    userMessage: "服务器内部错误，请稍后重试",
    httpStatus: 500,
    severity: "high",
  },
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    userMessage: "未授权访问，请重新登录",
    httpStatus: 401,
    severity: "high",
  },
  NETWORK_ERROR: {
    code: "NETWORK_ERROR",
    userMessage: "网络连接失败，请检查网络设置",
    severity: "high",
  },
  TIMEOUT_ERROR: {
    code: "TIMEOUT_ERROR",
    userMessage: "请求超时，请稍后重试",
    severity: "medium",
  },
  PARSE_ERROR: {
    code: "PARSE_ERROR",
    userMessage: "数据解析失败",
    severity: "high",
  },
};

export const statusCodeMapping: Record<number, ErrorCode> = {
  400: "VALIDATION_ERROR",
  401: "UNAUTHORIZED",
  403: "UNAUTHORIZED",
  404: "NOT_FOUND",
  409: "BUSINESS_RULE_VIOLATION",
  422: "VALIDATION_ERROR",
  500: "INTERNAL_ERROR",
  502: "INTERNAL_ERROR",
  503: "INTERNAL_ERROR",
  504: "TIMEOUT_ERROR",
};

export const businessRuleMappings: Record<BusinessRuleCode, string> = {
  INVALID_STATUS_TRANSITION: "状态转换不合法",
  CARD_NOT_TRANSITIONABLE_TO_REJECTED: "已完成的任务不能拒绝!",
  CARD_MUST_BE_STARTED_BEFORE_COMPLETION: "任务必须先开始才能完成",
  CARD_CANNOT_BE_REOPENED: "已开始的任务不能重新打开",
};

export const extractApiError = async (
  response: Response,
): Promise<ApiError> => {
  try {
    const data = await response.json();
    const errorData = data.error || data;
    return {
      code:
        (errorData.code as ErrorCode) ||
        statusCodeMapping[response.status] ||
        "INTERNAL_ERROR",
      message: errorData.message || `HTTP ${response.status} Error`,
      details: errorData.details,
      timestamp: errorData.timestamp || new Date().toISOString(),
    };
  } catch {
    return {
      code: statusCodeMapping[response.status] || "INTERNAL_ERROR",
      message: `HTTP ${response.status} Error`,
      timestamp: new Date().toISOString(),
    };
  }
};

export const getBusinessRuleMessage = (error: ApiError): string => {
  if (error.code !== "BUSINESS_RULE_VIOLATION") {
    return errorMappings["BUSINESS_RULE_VIOLATION"].userMessage;
  }

  const ruleCode = error.details?.ruleCode as BusinessRuleCode | undefined;

  if (ruleCode && businessRuleMappings[ruleCode]) {
    return businessRuleMappings[ruleCode];
  }

  const message = errorMappings["BUSINESS_RULE_VIOLATION"].userMessage;
  const reason = error.details?.reason;
  if (reason) {
    return `${message} (${reason})`;
  }

  return message;
};

export const getErrorMessage = (error: ApiError): string => {
  if (error.code === "BUSINESS_RULE_VIOLATION") {
    return getBusinessRuleMessage(error);
  }

  const mapping = errorMappings[error.code];
  if (!mapping) {
    return error.message || "未知错误";
  }

  const baseMessage = mapping.userMessage;

  if (error.details?.reason) {
    return `${baseMessage}: ${error.details.reason}`;
  }

  if (error.details?.field) {
    return `${baseMessage}（字段: ${error.details.field}）`;
  }

  return baseMessage;
};

export class HttpError extends Error {
  public readonly httpInfo: HttpErrorInfo;
  public readonly apiError?: ApiError;

  constructor(info: HttpErrorInfo, apiError?: ApiError) {
    super(apiError?.message || `HTTP Error: ${info.status} ${info.statusText}`);
    this.name = "HttpError";
    this.httpInfo = info;
    this.apiError = apiError;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export class RequestError extends Error {
  public readonly apiError: ApiError;
  public readonly httpInfo?: HttpErrorInfo;

  constructor(apiError: ApiError, httpInfo?: HttpErrorInfo) {
    super(apiError.message);
    this.name = "RequestError";
    this.apiError = apiError;
    this.httpInfo = httpInfo;
    Object.setPrototypeOf(this, RequestError.prototype);
  }
}

export class NetworkError extends Error {
  public readonly originalError: Error;

  constructor(originalError: Error) {
    super("Network request failed");
    this.name = "NetworkError";
    this.originalError = originalError;
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class TimeoutError extends Error {
  constructor() {
    super("Request timed out");
    this.name = "TimeoutError";
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

export class ParseError extends Error {
  public readonly response: Response;

  constructor(response: Response) {
    super("Failed to parse response");
    this.name = "ParseError";
    this.response = response;
    Object.setPrototypeOf(this, ParseError.prototype);
  }
}
