@echo off
echo =============================================
echo       Kanban for Agent 一键安装脚本
echo =============================================
echo.

rem 检查 Git 是否安装
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git 未安装
    echo 请先安装 Git: https://git-scm.com/download/win
    pause
    exit /b 1
)
echo OK: Git 已安装

rem 检查 Node.js 是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js 未安装
    echo 请先安装 Node.js: https://nodejs.org/zh-cn/download/
    pause
    exit /b 1
)
echo OK: Node.js 已安装
for /f "delims=" %%v in ('node --version') do set nodeVersion=%%v
echo Node.js 版本: %nodeVersion%

rem 设置安装目录
set "InstallDir=C:\kanban-for-agent"
set /p "inputDir=请输入安装目录 (默认: C:\kanban-for-agent): "
if not "%inputDir%"=="" set "InstallDir=%inputDir%"

echo.
echo 安装目录: %InstallDir%

rem 创建安装目录
if exist "%InstallDir%" (
    echo WARNING: 目录已存在，将覆盖现有文件
) else (
    mkdir "%InstallDir%"
    echo OK: 创建目录成功
)

rem 克隆仓库
echo.
echo 正在克隆仓库...

if exist "%InstallDir%\.git" (
    echo 检测到现有仓库，执行 git pull...
    cd /d "%InstallDir%"
    git pull origin master
) else (
    cd /d "%InstallDir%\.."
    git clone https://github.com/JPs-git/kanban-for-agent.git "%InstallDir%\.."
)

if %errorlevel% neq 0 (
    echo ERROR: 克隆仓库失败
    pause
    exit /b 1
)
echo OK: 仓库克隆成功

rem 安装 CLI
echo.
echo 正在安装 CLI...

cd /d "%InstallDir%\kanban-cli"
npm install
if %errorlevel% neq 0 (
    echo ERROR: CLI 依赖安装失败
    pause
    exit /b 1
)

npm link
if %errorlevel% neq 0 (
    echo ERROR: CLI 链接失败
    pause
    exit /b 1
)
echo OK: CLI 安装成功

rem 完成
echo.
echo =============================================
echo          安装完成！
echo =============================================
echo.
echo 使用方法:
echo   kanban deploy     - 部署应用（首次使用）
echo   kanban start      - 启动服务
echo   kanban stop       - 停止服务
echo   kanban status     - 查看状态
echo   kanban restart    - 重启服务
echo   kanban logs       - 查看日志
echo.
echo 首次部署请执行: kanban deploy
echo.
pause