import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';

class ApiClient {
  constructor() {
    this.baseUrl = `http://${config.serverHost}:${config.serverPort}`;
  }

  async request(method, endpoint, data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const options = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || `HTTP error! status: ${response.status}`;
        logger.error(`API request failed: ${method} ${endpoint} - ${errorMessage}`);
        throw new Error(errorMessage);
      }

      return responseData;
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.message.includes('Failed to fetch')) {
        logger.error('Cannot connect to Kanban backend service. Please start the service first with `kanban start`.');
      }
      throw error;
    }
  }

  async getCards() {
    return this.request('GET', '/api/cards');
  }

  async getCard(id) {
    return this.request('GET', `/api/cards/${id}`);
  }

  async createCard(cardData) {
    return this.request('POST', '/api/cards', cardData);
  }

  async updateCard(id, cardData) {
    return this.request('PUT', `/api/cards/${id}`, cardData);
  }

  async deleteCard(id) {
    return this.request('DELETE', `/api/cards/${id}`);
  }
}

export { ApiClient };
export const apiClient = new ApiClient();