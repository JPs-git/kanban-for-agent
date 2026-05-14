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

function runCommandSilent(cmd) {
  try {
    const result = execSync(cmd, { stdio: [] });
    return result?.toString()?.trim();
  } catch (error) {
    return null;
  }
}

function checkRemoteBranchExists(branchName) {
  try {
    const result = execSync(`git ls-remote --heads origin ${branchName}`, { stdio: [] });
    const output = result.toString().trim();
    return output.includes(`refs/heads/${branchName}`);
  } catch (error) {
    return false;
  }
}

function checkLocalBranchExists(branchName) {
  try {
    const result = execSync(`git branch --list ${branchName}`, { stdio: [] });
    const output = result.toString().trim();
    return output.length > 0;
  } catch (error) {
    return false;
  }
}

function deleteLocalBranch(branchName) {
  try {
    execSync(`git branch -D ${branchName}`, { stdio: [] });
    return true;
  } catch (error) {
    return false;
  }
}

function getRepoInfo() {
  const remoteUrl = runCommandSilent('git remote get-url origin');
  if (!remoteUrl) {
    return null;
  }
  
  const match = remoteUrl.match(/github\.com[\/:]([^\/]+)\/([^\/.]+)/);
  if (match) {
    return {
      owner: match[1],
      repo: match[2]
    };
  }
  return null;
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
  const initBranchName = `init/${branchName}`;
  const version = `${versionBase}.0`;

  console.log(`\n=== Initializing version branch ${branchName} ===\n`);

  try {
    console.log('0. Checking if version branch exists...');
    const remoteBranchExists = checkRemoteBranchExists(branchName);

    if (remoteBranchExists) {
      console.error(`Error: Version branch ${branchName} already exists on remote`);
      process.exit(1);
    }

    console.log('1. Getting repository info...');
    const repoInfo = getRepoInfo();
    if (!repoInfo) {
      console.error('Error: Could not get repository information');
      process.exit(1);
    }
    console.log(`   Owner: ${repoInfo.owner}, Repo: ${repoInfo.repo}`);

    console.log('2. Fetching latest changes from origin...');
    runCommand('git fetch origin');

    console.log('3. Checking out master branch...');
    runCommand('git checkout master');

    console.log('4. Pulling latest master...');
    runCommand('git pull origin master');

    console.log('5. Getting master branch SHA...');
    const masterSha = runCommandSilent('git rev-parse origin/master');
    if (!masterSha) {
      console.error('Error: Could not get master branch SHA');
      process.exit(1);
    }
    console.log(`   Master SHA: ${masterSha}`);

    console.log('6. Creating version branch via GitHub API...');
    runCommand(`gh api repos/${repoInfo.owner}/${repoInfo.repo}/git/refs -X POST -f ref=refs/heads/${branchName} -f sha=${masterSha}`);

    console.log('7. Checking for existing local init branch...');
    if (checkLocalBranchExists(initBranchName)) {
      console.log(`   Deleting existing local ${initBranchName} branch...`);
      deleteLocalBranch(initBranchName);
    }

    console.log('8. Creating init branch...');
    runCommand(`git checkout -b ${initBranchName}`);

    console.log('9. Adding empty commit for PR...');
    runCommand('git commit --allow-empty -m "chore: init version branch"');

    console.log('10. Pushing init branch to remote...');
    runCommand(`git push -u origin ${initBranchName}`);

    console.log('11. Creating PR with gh CLI...');
    const prTitle = `chore: init version for ${branchName}`;
    const prBody = `自动初始化版本号至 ${version}\n\n- 目标分支: ${branchName}\n- 版本号: ${version}`;
    runCommand(`gh pr create --base ${branchName} --head ${initBranchName} --title "${prTitle}" --body "${prBody}"`);

    console.log('12. Enabling auto-merge for PR...');
    runCommand(`gh pr merge ${initBranchName} --auto --squash --delete-branch`);

    console.log(`\n=== Successfully initialized version branch ${branchName} ===`);
    console.log(`Version: ${version}`);
    console.log(`Init branch: ${initBranchName}`);
    console.log(`Target branch: ${branchName}`);
    console.log(`\nAutomation:`);
    console.log(`1. PR has been created and auto-merge enabled`);
    console.log(`2. CI will automatically update VERSION to ${version}`);
    console.log(`3. PR will be auto-merged when all checks pass`);

  } catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  }
}

main();