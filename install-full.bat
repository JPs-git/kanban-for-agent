@echo off
echo ================================
echo   Kanban for Agent Installer
echo ================================
echo.

git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed
    echo Please install Git first: https://git-scm.com/download/win
    pause
    exit /b 1
)
echo OK: Git is installed

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js: https://nodejs.org/
    pause
    exit /b 1
)
echo OK: Node.js is installed

set "INSTALL_DIR=%USERPROFILE%\kanban-for-agent"
echo Install directory: %INSTALL_DIR%

if exist "%INSTALL_DIR%" (
    echo WARNING: Directory already exists, updating...
) else (
    mkdir "%INSTALL_DIR%"
    echo OK: Directory created
)

echo.
echo Cloning repository...

if exist "%INSTALL_DIR%\.git" (
    cd /d "%INSTALL_DIR%"
    git checkout master
    git pull origin master
) else (
    rmdir /s /q "%INSTALL_DIR%" 2>nul
    git clone https://github.com/JPs-git/kanban-for-agent.git "%INSTALL_DIR%"
)

if %errorlevel% neq 0 (
    echo ERROR: Failed to clone repository
    pause
    exit /b 1
)
echo OK: Repository cloned

echo.
echo Installing CLI...

if not exist "%INSTALL_DIR%\kanban-cli" (
    echo ERROR: kanban-cli directory not found
    pause
    exit /b 1
)

cd /d "%INSTALL_DIR%\kanban-cli"

npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install CLI dependencies
    pause
    exit /b 1
)

npm link
if %errorlevel% neq 0 (
    echo ERROR: Failed to link CLI
    pause
    exit /b 1
)
echo OK: CLI installed

echo.
echo ================================
echo   Installation Complete!
echo ================================
echo.
echo Commands:
echo   kanban deploy     - Deploy application
echo   kanban start      - Start service
echo   kanban stop       - Stop service
echo   kanban status     - Check status
echo   kanban restart    - Restart service
echo   kanban logs       - View logs
echo.
echo Run 'kanban deploy' to start deployment
echo.