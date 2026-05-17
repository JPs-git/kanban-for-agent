#!/usr/bin/env node

import { program } from 'commander';
import { 
  deploy, 
  update, 
  start, 
  stop, 
  status, 
  restart, 
  logs,
  cards,
  cardGet,
  cardCreate,
  cardUpdate,
  cardDelete,
  cardGetHelp,
  cardCreateHelp,
  cardUpdateHelp,
  cardDeleteHelp,
} from './commands/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const version = fs.readFileSync(path.join(__dirname, '../../VERSION'), 'utf-8').trim();

program
  .version(version)
  .description('Kanban for Agent CLI - Local deployment and card management tool');

program
  .command('deploy')
  .description('Deploy the Kanban application from local repository')
  .action(async () => {
    await deploy();
  });

program
  .command('update')
  .description('Update the Kanban application from remote repository')
  .option('--repo <url>', 'Repository URL to update from')
  .action(async (options) => {
    await update(options.repo);
  });

program
  .command('start')
  .description('Start the Kanban backend service')
  .action(async () => {
    await start();
  });

program
  .command('stop')
  .description('Stop the Kanban backend service')
  .action(async () => {
    await stop();
  });

program
  .command('status')
  .description('Check the status of the Kanban service')
  .action(() => {
    status();
  });

program
  .command('restart')
  .description('Restart the Kanban backend service')
  .action(async () => {
    await restart();
  });

program
  .command('logs')
  .description('Show the logs of the Kanban backend service')
  .option('--lines <n>', 'Number of log lines to show', 50)
  .action((options) => {
    logs(parseInt(options.lines, 10));
  });

program
  .command('cards')
  .description('List all cards (output: JSON)')
  .action(async () => {
    await cards();
  });

program
  .command('card-get')
  .description('Get a single card by ID (output: JSON)')
  .option('--id <id>', 'Card UUID')
  .action(async (options) => {
    await cardGet(options);
  });

program
  .command('card-create')
  .description('Create a new card (output: JSON)')
  .option('--title <title>', 'Card title (required)')
  .option('--content <content>', 'Card description')
  .option('--status <status>', 'Card status: TODO, IN_PROGRESS, DONE, REJECTED')
  .option('--assignee <assignee>', 'Assignee UUID')
  .option('--assigneeName <name>', 'Assignee display name')
  .action(async (options) => {
    await cardCreate(options);
  });

program
  .command('card-update')
  .description('Update an existing card (output: JSON)')
  .option('--id <id>', 'Card UUID (required)')
  .option('--title <title>', 'New card title')
  .option('--content <content>', 'New card description')
  .option('--status <status>', 'New status: TODO, IN_PROGRESS, DONE, REJECTED')
  .option('--assignee <assignee>', 'New assignee UUID')
  .option('--assigneeName <name>', 'New assignee display name')
  .action(async (options) => {
    await cardUpdate(options);
  });

program
  .command('card-delete')
  .description('Delete a card by ID')
  .option('--id <id>', 'Card UUID (required)')
  .action(async (options) => {
    await cardDelete(options);
  });

program.parse();
