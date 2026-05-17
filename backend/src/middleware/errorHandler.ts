import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";
import { logger } from "../utils/logger.js";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  logger.error("UNHANDLED_ERROR", "Unhandled error occurred", {
    error: error.message,
    stack: error.stack,
  });

  if (error instanceof AppError) {
    res.status(error.httpStatus).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
      details: undefined,
      timestamp: new Date().toISOString(),
    },
  });
};
