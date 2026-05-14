import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GitService } from '../../src/services/git_service.js';
import { config } from '../../src/utils/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('GitService', () => {
  const originalRepoPath = config.repoPath;
  const tempDir = path.join(__dirname, 'temp-git');

  beforeEach(() => {
    config.set('paths.repo', path.join(tempDir, 'repo'));
    fs.mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    config.set('paths.repo', originalRepoPath);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should check if git is available', () => {
    const service = new GitService();
    const result = service.isGitAvailable();
    expect(typeof result).toBe('boolean');
  });

  test('should return unknown commit when repo does not exist', () => {
    const service = new GitService();
    const commit = service.getCurrentCommit();
    expect(commit).toBe('unknown');
  });

  test('should return unknown branch when repo does not exist', () => {
    const service = new GitService();
    const branch = service.getCurrentBranch();
    expect(branch).toBe('unknown');
  });
});
