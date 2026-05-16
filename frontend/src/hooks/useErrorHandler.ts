import { useCallback } from "react";
import { useToast } from "../context/useToast";
import {
  RequestError,
  NetworkError,
  TimeoutError,
  ParseError,
  HttpError,
  getErrorMessage,
  type ApiError,
} from "../services/errorHandler";

export const useErrorHandler = () => {
  const { showError, showWarning } = useToast();

  const handleError = useCallback(
    (error: unknown, fallbackMessage?: string): void => {
      let message: string;
      let toastType: "error" | "warning" = "error";

      if (error instanceof RequestError) {
        message = getErrorMessage(error.apiError);
        if (error.apiError.code === "BUSINESS_RULE_VIOLATION") {
          toastType = "warning";
        }
      } else if (error instanceof HttpError && error.apiError) {
        message = getErrorMessage(error.apiError);
        if (error.apiError.code === "BUSINESS_RULE_VIOLATION") {
          toastType = "warning";
        }
      } else if (error instanceof NetworkError) {
        const networkError: ApiError = {
          code: "NETWORK_ERROR",
          message: "Network request failed",
        };
        message = getErrorMessage(networkError);
      } else if (error instanceof TimeoutError) {
        const timeoutError: ApiError = {
          code: "TIMEOUT_ERROR",
          message: "Request timed out",
        };
        message = getErrorMessage(timeoutError);
      } else if (error instanceof ParseError) {
        const parseError: ApiError = {
          code: "PARSE_ERROR",
          message: "Failed to parse response",
        };
        message = getErrorMessage(parseError);
      } else if (error instanceof Error) {
        message = error.message || fallbackMessage || "操作失败";
      } else {
        message = fallbackMessage || "操作失败";
      }

      if (toastType === "warning") {
        showWarning(message);
      } else {
        showError(message);
      }
      console.error("Error occurred:", error);
    },
    [showError, showWarning],
  );

  const wrapAsync = useCallback(
    async <T>(
      fn: () => Promise<T>,
      fallbackMessage?: string,
    ): Promise<T | undefined> => {
      try {
        return await fn();
      } catch (error) {
        handleError(error, fallbackMessage);
        return undefined;
      }
    },
    [handleError],
  );

  return { handleError, wrapAsync };
};
