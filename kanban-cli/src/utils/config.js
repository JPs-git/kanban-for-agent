import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_CONFIG = {
  repository: {
    url: 'https://github.com/JPs-git/kanban-for-agent.git',
    branch: 'master'
  },
  paths: {
    repo: '~/.kanban-for-agent/repo',
    data: '~/.kanban-for-agent/data',
    logs: '~/.kanban-for-agent/logs',
    pids: '~/.kanban-for-agent/pids'
  },
  server: {
    host: '0.0.0.0',
    port: 24954
  },
  frontend: {
    output_path: 'backend/dist/public'
  }
};

class Config {
  constructor() {
    this.config = {};
    this.load();
  }

  load(configPath) {
    const configFile = configPath
      ? path.resolve(configPath)
      : path.join(this.expandPath('~/.kanban-for-agent'), 'config.yaml');

    if (fs.existsSync(configFile)) {
      const content = fs.readFileSync(configFile, 'utf8');
      this.config = yaml.parse(content) || {};
    } else {
      this.config = { ...DEFAULT_CONFIG };
      this.save();
    }
  }

  save(configPath) {
    const configFile = configPath
      ? path.resolve(configPath)
      : path.join(this.expandPath('~/.kanban-for-agent'), 'config.yaml');

    const dir = path.dirname(configFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(configFile, yaml.stringify(this.config, null, 2));
  }

  get(key, defaultValue) {
    const keys = key.split('.');
    let value = this.config;

    for (const k of keys) {
      if (typeof value === 'object' && value !== null && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }

    return value !== undefined ? value : defaultValue;
  }

  set(key, value) {
    const keys = key.split('.');
    let config = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in config)) {
        config[k] = {};
      }
      config = config[k];
    }

    config[keys[keys.length - 1]] = value;
  }

  expandPath(p) {
    if (p.startsWith('~')) {
      const home = process.platform === 'win32'
        ? process.env.USERPROFILE
        : process.env.HOME;
      return p.replace('~', home);
    }
    return path.resolve(p);
  }

  ensureDirs() {
    const dirs = ['paths.repo', 'paths.data', 'paths.logs', 'paths.pids'];
    for (const key of dirs) {
      const dir = this.expandPath(this.get(key, ''));
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  get repoPath() {
    return this.expandPath(this.get('paths.repo', '~/.kanban-for-agent/repo'));
  }

  get dataPath() {
    return this.expandPath(this.get('paths.data', '~/.kanban-for-agent/data'));
  }

  get logsPath() {
    return this.expandPath(this.get('paths.logs', '~/.kanban-for-agent/logs'));
  }

  get pidsPath() {
    return this.expandPath(this.get('paths.pids', '~/.kanban-for-agent/pids'));
  }

  get repoUrl() {
    return this.get('repository.url', DEFAULT_CONFIG.repository.url);
  }

  get repoBranch() {
    return this.get('repository.branch', DEFAULT_CONFIG.repository.branch);
  }

  get serverPort() {
    return this.get('server.port', 3000);
  }

  get serverHost() {
    return this.get('server.host', '0.0.0.0');
  }
}

export { Config };
export const config = new Config();
