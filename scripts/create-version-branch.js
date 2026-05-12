#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(cmd, options = {}) {
  console.log(`> ${cmd}`);
  try {
    const result = execSync(cmd, { ...options, stdio: 'inherit' });
    return result?.toString()?.trim();
  } catch (error) {
    return null;
  }
}

function main() {
  const versionBase = process.argv[2];

  if (!versionBase) {
    console.error('Usage: node scripts/create-version-branch.js <version-base>');
    console.error('Example: node scripts/create-version-branch.js 0.7');
    process.exit(1);
  }

  if (!/^[0-9]+\.[0-9]+$/.test(versionBase)) {
    console.error('Invalid version format. Expected format: X.Y (e.g., 0.7)');
    process.exit(1);
  }

  const branchName = `v${versionBase}`;
  const version = `${versionBase}.0`;

  console.log(`\n=== Creating version branch ${branchName} ===\n`);

  try {
    console.log('0. Checking if branch exists and cleanup...');
    const localBranchExists = runCommand(`git rev-parse --verify ${branchName}`) !== null;
    const remoteBranchExists = runCommand(`git ls-remote --heads origin ${branchName}`) !== null;

    if (localBranchExists) {
      const currentBranch = runCommand('git branch --show-current');
      if (currentBranch === branchName) {
        console.log(`   Switching away from ${branchName}...`);
        runCommand('git checkout master');
      }
      console.log(`   Deleting local branch ${branchName}...`);
      runCommand(`git branch -D ${branchName}`);
    }

    if (remoteBranchExists) {
      console.log(`   Deleting remote branch ${branchName}...`);
      runCommand(`git push origin --delete ${branchName}`);
    }

    console.log('\n1. Fetching latest changes from origin...');
    runCommand('git fetch origin');

    console.log('\n2. Checking out master branch...');
    runCommand('git checkout master');

    console.log('\n3. Pulling latest master...');
    runCommand('git pull origin master');

    console.log('\n4. Creating version branch...');
    runCommand(`git checkout -b ${branchName}`);

    console.log('\n5. Updating VERSION file...');
    fs.writeFileSync(path.join(__dirname, '../VERSION'), version);
    console.log(`   VERSION updated to: ${version}`);

    console.log('\n6. Syncing versions to packages...');
    runCommand('node scripts/version-sync.js');

    console.log('\n7. Committing changes...');
    runCommand(`git add VERSION package.json backend/package.json frontend/package.json kanban-cli/package.json`);
    runCommand(`git commit -m "chore: create version branch ${branchName}"`);

    console.log('\n8. Pushing to remote...');
    runCommand(`git push origin ${branchName}`);

    console.log(`\n=== Successfully created version branch ${branchName} ===`);
    console.log(`Version: ${version}`);
    console.log(`Branch: ${branchName}`);

  } catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  }
}

main();
