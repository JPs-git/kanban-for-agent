import { logger } from '../utils/logger.js';
import { BackendService } from '../services/backend_service.js';
import { config } from '../utils/config.js';

export async function deploy(repoUrl) {
  const backendService = new BackendService();

  const success = await backendService.deploy(repoUrl);

  if (success) {
    logger.success('Deployment completed successfully!');
    await backendService.start();
    logger.info(`Kanban service is starting on port ${config.serverPort}`);
  } else {
    logger.failure('Deployment failed. Check logs for details.');
    process.exit(1);
  }
}

export async function start() {
  const backendService = new BackendService();

  if (await backendService.start()) {
    logger.success('Kanban service started successfully!');
  } else {
    logger.failure('Failed to start Kanban service. Check if it is already running.');
    process.exit(1);
  }
}

export async function stop() {
  const backendService = new BackendService();

  if (await backendService.stop()) {
    logger.success('Kanban service stopped successfully!');
  } else {
    logger.failure('Failed to stop Kanban service.');
    process.exit(1);
  }
}

export function status() {
  const backendService = new BackendService();
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
  const backendService = new BackendService();

  if (await backendService.restart()) {
    logger.success('Kanban service restarted successfully!');
  } else {
    logger.failure('Failed to restart Kanban service.');
    process.exit(1);
  }
}

export function logs(lines = 50) {
  const backendService = new BackendService();
  const logLines = backendService.getLogs(lines);

  if (logLines.length > 0) {
    console.log(logLines.join('\n'));
  } else {
    console.log('No logs available.');
  }
}
