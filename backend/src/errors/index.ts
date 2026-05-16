export type ErrorCode = 'VALIDATION_ERROR' | 'NOT_FOUND' | 'BUSINESS_RULE_VIOLATION' | 'INTERNAL_ERROR' | 'UNAUTHORIZED';

export type BusinessRuleCode =
  | 'INVALID_STATUS_TRANSITION'
  | 'CARD_NOT_TRANSITIONABLE_TO_REJECTED'
  | 'CARD_MUST_BE_STARTED_BEFORE_COMPLETION'
  | 'CARD_CANNOT_BE_REOPENED';

export interface ErrorDetails {
  field?: string;
  reason?: string;
  ruleCode?: BusinessRuleCode;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly httpStatus: number;
  public readonly details?: ErrorDetails;
  public readonly timestamp: Date;

  constructor(message: string, code: ErrorCode, httpStatus: number, details?: ErrorDetails) {
    super(message);
    this.name = 'AppError';
    this.message = message;
    this.code = code;
    this.httpStatus = httpStatus;
    this.details = details;
    this.timestamp = new Date();
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 'NOT_FOUND', 404, details);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class BusinessRuleError extends AppError {
  public readonly ruleCode: BusinessRuleCode;

  constructor(message: string, ruleCode: BusinessRuleCode, details?: ErrorDetails) {
    super(message, 'BUSINESS_RULE_VIOLATION', 409, { ...details, ruleCode });
    this.name = 'BusinessRuleError';
    this.ruleCode = ruleCode;
    Object.setPrototypeOf(this, BusinessRuleError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 'UNAUTHORIZED', 401, details);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class InternalError extends AppError {
  constructor(message: string = 'Internal server error', details?: ErrorDetails) {
    super(message, 'INTERNAL_ERROR', 500, details);
    this.name = 'InternalError';
    Object.setPrototypeOf(this, InternalError.prototype);
  }
}