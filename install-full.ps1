# Kanban for Agent - 零基础一键安装脚本
# 使用方法: powershell -ExecutionPolicy Bypass -File install-full.ps1

$InstallDir = "C:\kanban-for-agent"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "      Kanban for Agent 一键安装脚本" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Git 是否安装
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Git 未安装" -ForegroundColor Red
    Write-Host "请先安装 Git: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}
Write-Host "OK: Git 已安装" -ForegroundColor Green

# 检查 Node.js 是否安装
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js 未安装" -ForegroundColor Red
    Write-Host "请先安装 Node.js: https://nodejs.org/zh-cn/download/" -ForegroundColor Yellow
    exit 1
}
Write-Host "OK: Node.js 已安装" -ForegroundColor Green

# 获取 Node.js 版本
$nodeVersion = node --version
Write-Host "Node.js 版本: $nodeVersion" -ForegroundColor Cyan

# 设置安装目录
Write-Host ""
$inputDir = Read-Host "请输入安装目录 (默认: C:\kanban-for-agent)"
if (-not [string]::IsNullOrEmpty($inputDir)) {
    $InstallDir = $inputDir
}

$InstallDir = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($InstallDir)
Write-Host "安装目录: $InstallDir" -ForegroundColor Cyan

# 创建安装目录
if (Test-Path $InstallDir) {
    Write-Host "WARNING: 目录已存在，将覆盖现有文件" -ForegroundColor Yellow
} else {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    Write-Host "OK: 创建目录成功" -ForegroundColor Green
}

# 克隆仓库
Write-Host ""
Write-Host "正在克隆仓库..." -ForegroundColor Cyan

Set-Location $InstallDir -ErrorAction SilentlyContinue
if (Test-Path (Join-Path $InstallDir ".git")) {
    Write-Host "检测到现有仓库，执行 git pull..." -ForegroundColor Yellow
    git pull origin master
} else {
    Set-Location (Split-Path $InstallDir -Parent)
    git clone https://github.com/JPs-git/kanban-for-agent.git (Split-Path $InstallDir -Leaf)
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: 克隆仓库失败" -ForegroundColor Red
    exit 1
}
Write-Host "OK: 仓库克隆成功" -ForegroundColor Green

# 安装 CLI
Write-Host ""
Write-Host "正在安装 CLI..." -ForegroundColor Cyan

Set-Location (Join-Path $InstallDir "kanban-cli")
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: CLI 依赖安装失败" -ForegroundColor Red
    exit 1
}

npm link
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: CLI 链接失败" -ForegroundColor Red
    exit 1
}
Write-Host "OK: CLI 安装成功" -ForegroundColor Green

# 完成
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "         安装完成！" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "使用方法:" -ForegroundColor Cyan
Write-Host "  kanban deploy     - 部署应用（首次使用）" -ForegroundColor White
Write-Host "  kanban start      - 启动服务" -ForegroundColor White
Write-Host "  kanban stop       - 停止服务" -ForegroundColor White
Write-Host "  kanban status     - 查看状态" -ForegroundColor White
Write-Host "  kanban restart    - 重启服务" -ForegroundColor White
Write-Host "  kanban logs       - 查看日志" -ForegroundColor White
Write-Host ""
Write-Host "首次部署请执行: kanban deploy" -ForegroundColor Yellow
Write-Host ""