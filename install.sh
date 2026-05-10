#!/bin/bash

set -e

echo "Installing Kanban CLI..."

cd "$(dirname "$0")"

if command -v npm &> /dev/null; then
    echo "Installing dependencies..."
    npm install --prefix kanban-cli
    
    echo "Linking CLI..."
    npm link --prefix kanban-cli
    
    echo ""
    echo "Installation complete!"
    echo ""
    echo "Usage:"
    echo "  kanban deploy           - Deploy the application"
    echo "  kanban start            - Start the service"
    echo "  kanban stop             - Stop the service"
    echo "  kanban status           - Check service status"
    echo "  kanban restart          - Restart the service"
    echo "  kanban logs             - View logs"
    echo ""
else
    echo "Error: npm is not installed"
    exit 1
fi
