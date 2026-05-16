import type { User } from "../types";
import { 
  extractApiError, 
  RequestError, 
  NetworkError, 
  TimeoutError,
  ParseError,
  type HttpErrorInfo
} from "./errorHandler";

const API_URL = "/api/users";

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

const fetchWithTimeout = async (input: RequestInfo, init?: RequestInit, timeout = 30000): Promise<Response> => {
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), timeout);
  
  try {
    const response = await fetch(input, {
      ...init,
      signal: abortController.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TimeoutError();
    }
    throw new NetworkError(error instanceof Error ? error : new Error('Network error'));
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getUsers = async (): Promise<User[]> => {
  const response = await fetchWithTimeout(API_URL);
  return handleResponse(response);
};

export const createUser = async (name: string): Promise<User> => {
  const response = await fetchWithTimeout(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  return handleResponse(response);
};

export const updateUser = async (id: string, name: string): Promise<User> => {
  const response = await fetchWithTimeout(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  return handleResponse(response);
};

export const deleteUser = async (id: string): Promise<void> => {
  const response = await fetchWithTimeout(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    const apiError = await extractApiError(response);
    const httpInfo = createHttpErrorInfo(response);
    throw new RequestError(apiError, httpInfo);
  }
};