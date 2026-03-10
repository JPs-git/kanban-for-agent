# Git Repository Setup

## Branches
- master: Main branch
- v0.1: Version branch

## Branch Protection Rules
1. **Do not push directly to master branch** - use pull requests instead
2. **Do not push directly to version branches (v*)** - use pull requests instead

## Git Hooks
A pre-push hook has been configured to run the following before pushing:
- npm test
- npm run build
- npm run lint

## GitHub CI
A CI workflow has been set up to run on:
- Push to master or version branches
- Pull requests to master or version branches

The CI will run:
- npm test
- npm run build
- npm run lint
