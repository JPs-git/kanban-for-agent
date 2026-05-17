import type { Card, CardCreate, CardUpdate } from "../types";
import {
  extractApiError,
  RequestError,
  NetworkError,
  TimeoutError,
  ParseError,
  type HttpErrorInfo,
} from "./errorHandler";

export interface VersionInfo {
  version: string;
  environment: string;
  buildDate?: string;
}

const API_URL = "/api/cards";

const createHttpErrorInfo = (response: Response): HttpErrorInfo => ({
  status: response.status,
  statusText: response.statusText,
  url: response.url,
});

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const apiError = await extractApiError(response);
    const httpInfo = createHttpErrorInfo(response);
    throw new RequestError(apiError, httpInfo);
  }

  try {
    return await response.json();
  } catch {
    throw new ParseError(response);
  }
};

const fetchWithTimeout = async (
  input: RequestInfo,
  init?: RequestInit,
  timeout = 30000,
): Promise<Response> => {
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), timeout);

  try {
    const response = await fetch(input, {
      ...init,
      signal: abortController.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new TimeoutError();
    }
    throw new NetworkError(
      error instanceof Error ? error : new Error("Network error"),
    );
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getVersion = async (): Promise<VersionInfo> => {
  const response = await fetchWithTimeout("/api/version");
  return handleResponse(response);
};

export const getCards = async (): Promise<Card[]> => {
  const response = await fetchWithTimeout(API_URL);
  return handleResponse(response);
};

export const createCard = async (card: CardCreate): Promise<Card> => {
  const response = await fetchWithTimeout(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(card),
  });
  return handleResponse(response);
};

export const updateCard = async (
  id: string,
  card: CardUpdate,
): Promise<Card> => {
  const response = await fetchWithTimeout(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(card),
  });
  return handleResponse(response);
};

export const deleteCard = async (id: string): Promise<void> => {
  const response = await fetchWithTimeout(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const apiError = await extractApiError(response);
    const httpInfo = createHttpErrorInfo(response);
    throw new RequestError(apiError, httpInfo);
  }
};
