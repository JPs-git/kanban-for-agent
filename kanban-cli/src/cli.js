#!/usr/bin/env node

import { program } from 'commander';
import { deploy, update, start, stop, status, restart, logs } from './commands/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const version = fs.readFileSync(path.join(__dirname, '../../VERSION'), 'utf-8').trim();

program
  .version(version)
  .description('Kanban for Agent CLI - Local deployment tool');

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

program.parse();
