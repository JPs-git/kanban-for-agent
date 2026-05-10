# Kanban CLI Installation Script for Windows

Write-Host "Installing Kanban CLI..." -ForegroundColor Green

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
cd $ScriptDir

if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    npm install --prefix kanban-cli
    
    Write-Host "Linking CLI..." -ForegroundColor Cyan
    npm link --prefix kanban-cli
    
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
} else {
    Write-Host "Error: npm is not installed" -ForegroundColor Red
    exit 1
}
