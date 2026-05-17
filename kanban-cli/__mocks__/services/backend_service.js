import { jest } from '@jest/globals';

export const mockBackendService = {
  deploy: jest.fn(),
  update: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  restart: jest.fn(),
  getStatus: jest.fn(),
  getLogs: jest.fn(),
};

export class BackendService {
  constructor() {
    return mockBackendService;
  }
}