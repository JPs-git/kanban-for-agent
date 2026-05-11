# Kanban CLI Installation Script for Windows

Write-Host "Installing Kanban CLI..." -ForegroundColor Green

$repoDir = Join-Path $env:USERPROFILE ".kanban-for-agent\repo"
Write-Host "Install directory: $repoDir" -ForegroundColor Cyan

if (Test-Path $repoDir) {
    Write-Host "Directory already exists, updating..." -ForegroundColor Yellow
}

Write-Host "Cloning repository..." -ForegroundColor Cyan

if (Test-Path (Join-Path $repoDir ".git")) {
    Set-Location $repoDir
    git checkout master
    git pull origin master
} else {
    if (Test-Path $repoDir) {
        Remove-Item -Recurse -Force $repoDir
    }
    git clone https://github.com/JPs-git/kanban-for-agent.git $repoDir
}

if (-not $?) {
    Write-Host "ERROR: Failed to clone repository" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Repository cloned" -ForegroundColor Green

Write-Host ""
Write-Host "Installing CLI..." -ForegroundColor Cyan

$cliDir = Join-Path $repoDir "kanban-cli"
if (-not (Test-Path $cliDir)) {
    Write-Host "ERROR: kanban-cli directory not found" -ForegroundColor Red
    exit 1
}

Set-Location $cliDir

npm install
if (-not $?) {
    Write-Host "ERROR: Failed to install CLI dependencies" -ForegroundColor Red
    exit 1
}

npm link
if (-not $?) {
    Write-Host "ERROR: Failed to link CLI" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Usage:" -ForegroundColor Cyan
Write-Host "  kanban deploy           - Deploy the application"
Write-Host "  kanban start            - Start the service"
Write-Host "  kanban stop             - Stop the service"
Write-Host "  kanban status           - Check service status"
Write-Host "  kanban restart          - Restart the service"
Write-Host "  kanban logs             - View logs"
Write-Host ""
