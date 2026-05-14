import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Config', () => {
  const originalHome = process.env.HOME;
  const originalUserProfile = process.env.USERPROFILE;
  const tempDir = path.join(__dirname, 'temp-config');

  beforeEach(() => {
    process.env.HOME = tempDir;
    process.env.USERPROFILE = tempDir;
    fs.mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    process.env.HOME = originalHome;
    process.env.USERPROFILE = originalUserProfile;
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
  });

  test('should expand home path correctly', async () => {
    const { Config } = await import('../../src/utils/config.js');
    const config = new Config();
    
    const expanded = config.expandPath('~/.kanban-for-agent');
    expect(path.normalize(expanded)).toBe(path.normalize(path.join(tempDir, '.kanban-for-agent')));
  });

  test('should return default config when config file does not exist', async () => {
    const { Config } = await import('../../src/utils/config.js');
    const config = new Config();
    
    const result = config.get('repository.url');
    expect(result).toBe('https://github.com/JPs-git/kanban-for-agent.git');
  });

  test('should set and get config values', async () => {
    const { Config } = await import('../../src/utils/config.js');
    const config = new Config();
    
    config.set('server.port', 3000);
    expect(config.get('server.port')).toBe(3000);
  });

  test('should return default value for missing key', async () => {
    const { Config } = await import('../../src/utils/config.js');
    const config = new Config();
    
    const result = config.get('nonexistent.key', 'default');
    expect(result).toBe('default');
  });

  test('should provide correct paths', async () => {
    const { Config } = await import('../../src/utils/config.js');
    const config = new Config();
    
    expect(path.normalize(config.repoPath)).toBe(path.normalize(path.join(tempDir, '.kanban-for-agent', 'repo')));
    expect(path.normalize(config.dataPath)).toBe(path.normalize(path.join(tempDir, '.kanban-for-agent', 'data')));
    expect(path.normalize(config.logsPath)).toBe(path.normalize(path.join(tempDir, '.kanban-for-agent', 'logs')));
    expect(path.normalize(config.pidsPath)).toBe(path.normalize(path.join(tempDir, '.kanban-for-agent', 'pids')));
  });

  test('should ensure directories exist', async () => {
    const { Config } = await import('../../src/utils/config.js');
    const config = new Config();
    
    config.ensureDirs();
    expect(fs.existsSync(config.repoPath)).toBe(true);
    expect(fs.existsSync(config.dataPath)).toBe(true);
    expect(fs.existsSync(config.logsPath)).toBe(true);
    expect(fs.existsSync(config.pidsPath)).toBe(true);
  });
});
