import { ApiClient } from '../services/api_client.js';
import { logger } from '../utils/logger.js';

let ApiClientClass = ApiClient;
let loggerInstance = logger;

export function __setApiClient(client) {
  ApiClientClass = client;
}

export function __setLogger(log) {
  loggerInstance = log;
}

const STATUS_TRANSITIONS = {
  TODO: ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['TODO', 'DONE', 'REJECTED'],
  DONE: ['IN_PROGRESS'],
  REJECTED: ['TODO'],
};

const API_ENDPOINTS = {
  list: 'GET /api/cards',
  get: 'GET /api/cards/:id',
  create: 'POST /api/cards',
  update: 'PUT /api/cards/:id',
  delete: 'DELETE /api/cards/:id',
};

export async function cards() {
  const apiClient = new ApiClientClass();
  
  try {
    const cards = await apiClient.getCards();
    console.log(JSON.stringify(cards, null, 2));
  } catch (error) {
    loggerInstance.failure(`Failed to list cards: ${error.message}`);
    process.exit(1);
  }
}

export async function cardGet(options) {
  if (!options.id) {
    loggerInstance.error('Card ID is required');
    console.log(cardGetHelp);
    process.exit(1);
  }

  const apiClient = new ApiClientClass();
  
  try {
    const card = await apiClient.getCard(options.id);
    console.log(JSON.stringify(card, null, 2));
  } catch (error) {
    loggerInstance.failure(`Failed to get card: ${error.message}`);
    process.exit(1);
  }
}

export async function cardCreate(options) {
  if (!options.title || options.title.trim() === '') {
    loggerInstance.error('Title is required');
    console.log(cardCreateHelp);
    process.exit(1);
  }

  const cardData = {
    title: options.title,
    content: options.content,
    status: options.status || 'TODO',
    assignee: options.assignee,
    assigneeName: options.assigneeName,
  };

  const apiClient = new ApiClientClass();
  
  try {
    const card = await apiClient.createCard(cardData);
    console.log(JSON.stringify(card, null, 2));
    loggerInstance.success('Card created successfully');
  } catch (error) {
    loggerInstance.failure(`Failed to create card: ${error.message}`);
    process.exit(1);
  }
}

export async function cardUpdate(options) {
  if (!options.id) {
    loggerInstance.error('Card ID is required');
    console.log(cardUpdateHelp);
    process.exit(1);
  }

  const updateData = {};
  if (options.title !== undefined) {
    if (options.title.trim() === '') {
      loggerInstance.error('Title cannot be empty');
      console.log(cardUpdateHelp);
      process.exit(1);
    }
    updateData.title = options.title;
  }
  if (options.content !== undefined) updateData.content = options.content;
  if (options.status !== undefined) updateData.status = options.status;
  if (options.assignee !== undefined) updateData.assignee = options.assignee;
  if (options.assigneeName !== undefined) updateData.assigneeName = options.assigneeName;

  if (Object.keys(updateData).length === 0) {
    loggerInstance.error('At least one update field is required');
    console.log(cardUpdateHelp);
    process.exit(1);
  }

  const apiClient = new ApiClientClass();
  
  try {
    const card = await apiClient.updateCard(options.id, updateData);
    console.log(JSON.stringify(card, null, 2));
    loggerInstance.success('Card updated successfully');
  } catch (error) {
    loggerInstance.failure(`Failed to update card: ${error.message}`);
    process.exit(1);
  }
}

export async function cardDelete(options) {
  if (!options.id) {
    loggerInstance.error('Card ID is required');
    console.log(cardDeleteHelp);
    process.exit(1);
  }

  const apiClient = new ApiClientClass();
  
  try {
    await apiClient.deleteCard(options.id);
    loggerInstance.success('Card deleted successfully');
  } catch (error) {
    loggerInstance.failure(`Failed to delete card: ${error.message}`);
    process.exit(1);
  }
}

export const cardGetHelp = `
Usage: kanban card-get --id <card-id>

Get a single card by ID.

Arguments:
  --id <card-id>    Card UUID (required)

API Endpoint: ${API_ENDPOINTS.get}

Examples:
  kanban card-get --id 550e8400-e29b-41d4-a716-446655440000
`;

export const cardCreateHelp = `
Usage: kanban card-create --title <title> [--content <content>] [--status <status>] [--assignee <assignee>] [--assigneeName <name>]

Create a new card.

Arguments:
  --title <title>          Card title (required)
  --content <content>      Card description/content
  --status <status>        Card status: TODO, IN_PROGRESS, DONE, REJECTED (default: TODO)
  --assignee <assignee>    Assignee UUID
  --assigneeName <name>    Assignee display name (required when assignee is set)

API Endpoint: ${API_ENDPOINTS.create}

Business Rules:
  - Title is required and cannot be empty
  - Status must be one of: TODO, IN_PROGRESS, DONE, REJECTED
  - If assignee is provided, assigneeName must also be provided
  - Cards are created with a default status of TODO

Examples:
  kanban card-create --title "New Task"
  kanban card-create --title "Bug Fix" --content "Fix login issue" --status IN_PROGRESS
  kanban card-create --title "Feature" --assignee "user-uuid" --assigneeName "John Doe"
`;

export const cardUpdateHelp = `
Usage: kanban card-update --id <card-id> [--title <title>] [--content <content>] [--status <status>] [--assignee <assignee>] [--assigneeName <name>]

Update an existing card.

Arguments:
  --id <card-id>           Card UUID (required)
  --title <title>          New card title
  --content <content>      New card description
  --status <status>        New status: TODO, IN_PROGRESS, DONE, REJECTED
  --assignee <assignee>    New assignee UUID
  --assigneeName <name>    New assignee display name

API Endpoint: ${API_ENDPOINTS.update}

Business Rules:
  - At least one field must be provided for update
  - Title cannot be empty if provided
  - Status transitions must follow valid rules:
    - TODO → IN_PROGRESS, REJECTED
    - IN_PROGRESS → TODO, DONE, REJECTED
    - DONE → IN_PROGRESS
    - REJECTED → TODO
  - If assignee is provided, assigneeName must also be provided

Examples:
  kanban card-update --id 550e8400-e29b-41d4-a716-446655440000 --title "Updated Title"
  kanban card-update --id 550e8400-e29b-41d4-a716-446655440000 --status IN_PROGRESS
  kanban card-update --id 550e8400-e29b-41d4-a716-446655440000 --content "New content" --assignee "user-uuid" --assigneeName "Jane Doe"
`;

export const cardDeleteHelp = `
Usage: kanban card-delete --id <card-id>

Delete a card by ID.

Arguments:
  --id <card-id>    Card UUID (required)

API Endpoint: ${API_ENDPOINTS.delete}

Examples:
  kanban card-delete --id 550e8400-e29b-41d4-a716-446655440000
`;