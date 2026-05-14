import { logger } from '../utils/logger.js';
import { BackendService } from '../services/backend_service.js';
import { config } from '../utils/config.js';

let BackendServiceClass = BackendService;
let loggerInstance = logger;

export function __setBackendService(service) {
  BackendServiceClass = service;
}

export function __setLogger(log) {
  loggerInstance = log;
}

export async function deploy(repoUrl) {
  const backendService = new BackendServiceClass();

  const success = await backendService.deploy(repoUrl);

  if (success) {
    loggerInstance.success('Deployment completed successfully!');
    await backendService.start();
    loggerInstance.info(`Kanban service is starting on port ${config.serverPort}`);
  } else {
    loggerInstance.failure('Deployment failed. Check logs for details.');
    process.exit(1);
  }
}

export async function update() {
  const backendService = new BackendServiceClass();

  loggerInstance.info('Updating from repository...');
  const success = await backendService.update();

  if (success) {
    loggerInstance.success('Update completed successfully!');
    await backendService.restart();
    loggerInstance.info(`Kanban service restarted on port ${config.serverPort}`);
  } else {
    loggerInstance.failure('Update failed. Check logs for details.');
    process.exit(1);
  }
}

export async function start() {
  const backendService = new BackendServiceClass();

  if (await backendService.start()) {
    loggerInstance.success('Kanban service started successfully!');
  } else {
    loggerInstance.failure('Failed to start Kanban service. Check if it is already running.');
    process.exit(1);
  }
}

export async function stop() {
  const backendService = new BackendServiceClass();

  if (await backendService.stop()) {
    loggerInstance.success('Kanban service stopped successfully!');
  } else {
    loggerInstance.failure('Failed to stop Kanban service.');
    process.exit(1);
  }
}

export function status() {
  const backendService = new BackendServiceClass();
  const status = backendService.getStatus();

  if (status.running) {
    console.log('\u2705 Kanban service is RUNNING');
    if (status.pid) {
      console.log(`  PID: ${status.pid}`);
    }
    if (status.branch) {
      console.log(`  Branch: ${status.branch}`);
    }
    if (status.commit) {
      console.log(`  Commit: ${status.commit.substring(0, 8)}`);
    }
  } else {
    console.log('\u274C Kanban service is NOT RUNNING');
  }
}

export async function restart() {
  const backendService = new BackendServiceClass();

  if (await backendService.restart()) {
    loggerInstance.success('Kanban service restarted successfully!');
  } else {
    loggerInstance.failure('Failed to restart Kanban service.');
    process.exit(1);
  }
}

export function logs(lines = 50) {
  const backendService = new BackendServiceClass();
  const logLines = backendService.getLogs(lines);

  if (logLines.length > 0) {
    console.log(logLines.join('\n'));
  } else {
    console.log('No logs available.');
  }
}