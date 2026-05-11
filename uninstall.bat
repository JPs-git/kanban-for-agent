@echo off
echo ================================
echo   Kanban for Agent Uninstaller
echo ================================
echo.

set "REPO_DIR=%USERPROFILE%\.kanban-for-agent"
set "CLI_DIR=%REPO_DIR%\kanban-cli"

echo Stopping Kanban service if running...
if exist "%CLI_DIR%" (
    cd /d "%CLI_DIR%"
    kanban stop >nul 2>&1
)

echo.
echo Removing CLI links...
if exist "%CLI_DIR%" (
    cd /d "%CLI_DIR%"
    npm unlink >nul 2>&1
    if %errorlevel% equ 0 (
        echo OK: CLI links removed
    ) else (
        echo WARNING: Failed to remove CLI links (may not be installed)
    )
) else (
    echo OK: CLI directory does not exist
)

echo.
echo Removing repository directory...
if exist "%REPO_DIR%" (
    rmdir /s /q "%REPO_DIR%"
    if %errorlevel% equ 0 (
        echo OK: Repository directory removed
    ) else (
        echo ERROR: Failed to remove repository directory
        pause
        exit /b 1
    )
) else (
    echo OK: Repository directory does not exist
)

echo.
echo ================================
echo   Uninstallation Complete!
echo ================================
echo.
echo Kanban for Agent has been uninstalled.
echo.
pause