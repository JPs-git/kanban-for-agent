#!/bin/bash

# Kanban for Agent - 零基础一键安装脚本
# 使用方法: curl -sSL https://raw.githubusercontent.com/JPs-git/kanban-for-agent/main/install-full.sh | bash

set -e

echo "============================================="
echo "      Kanban for Agent 一键安装脚本"
echo "============================================="
echo ""

# 检查 Git 是否安装
if ! command -v git &> /dev/null; then
    echo "❌ 错误: Git 未安装"
    echo "请先安装 Git: sudo apt install git (Debian/Ubuntu) 或 brew install git (macOS)"
    exit 1
fi
echo "✅ Git 已安装"

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: Node.js 未安装"
    echo "请先安装 Node.js: https://nodejs.org/zh-cn/download/"
    exit 1
fi
echo "✅ Node.js 已安装"
echo "   Node.js 版本: $(node --version)"

# 设置安装目录
read -p "请输入安装目录 (默认: ~/kanban-for-agent): " INSTALL_DIR
if [ -z "$INSTALL_DIR" ]; then
    INSTALL_DIR="$HOME/kanban-for-agent"
fi

echo ""
echo "安装目录: $INSTALL_DIR"

# 创建安装目录
if [ -d "$INSTALL_DIR" ]; then
    echo "⚠️ 目录已存在，将覆盖现有文件"
else
    mkdir -p "$INSTALL_DIR"
    echo "✅ 创建目录成功"
fi

# 克隆仓库
echo ""
echo "正在克隆仓库..."

if [ -d "$INSTALL_DIR/.git" ]; then
    echo "检测到现有仓库，执行 git pull..."
    cd "$INSTALL_DIR"
    git pull origin master
else
    cd "$(dirname "$INSTALL_DIR")"
    git clone https://github.com/JPs-git/kanban-for-agent.git "$(basename "$INSTALL_DIR")"
fi

echo "✅ 仓库克隆成功"

# 安装 CLI
echo ""
echo "正在安装 CLI..."

cd "$INSTALL_DIR/kanban-cli"
npm install
echo "✅ CLI 依赖安装成功"

npm link
echo "✅ CLI 链接成功"

# 完成
echo ""
echo "============================================="
echo "         安装完成！"
echo "============================================="
echo ""
echo "使用方法:"
echo "  kanban deploy     - 部署应用（首次使用）"
echo "  kanban start      - 启动服务"
echo "  kanban stop       - 停止服务"
echo "  kanban status     - 查看状态"
echo "  kanban restart    - 重启服务"
echo "  kanban logs       - 查看日志"
echo ""
echo "首次部署请执行: kanban deploy"
echo ""