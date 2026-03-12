#!/bin/bash

# Docker Hub 仓库信息
DOCKER_HUB_USERNAME="starbowbreak"
REPO_NAME="kanban-for-agent"

# 从参数获取版本号，如果没有提供则使用默认值
VERSION=${1:-"1.0.0"}

# 显示用法
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    echo "Usage: ./push-to-dockerhub.sh [version]"
    echo "Example: ./push-to-dockerhub.sh 1.0.0"
    exit 0
fi

echo "Using version: $VERSION"

# 构建后端镜像
echo "Building backend image..."
docker build -t "$DOCKER_HUB_USERNAME/$REPO_NAME-backend:$VERSION" ./backend

# 构建前端镜像
echo "Building frontend image..."
docker build -t "$DOCKER_HUB_USERNAME/$REPO_NAME-frontend:$VERSION" ./frontend

# 推送后端镜像
echo "Pushing backend image to Docker Hub..."
docker push "$DOCKER_HUB_USERNAME/$REPO_NAME-backend:$VERSION"

# 推送前端镜像
echo "Pushing frontend image to Docker Hub..."
docker push "$DOCKER_HUB_USERNAME/$REPO_NAME-frontend:$VERSION"

# 添加标签 latest
echo "Adding latest tags..."
docker tag "$DOCKER_HUB_USERNAME/$REPO_NAME-backend:$VERSION" "$DOCKER_HUB_USERNAME/$REPO_NAME-backend:latest"
docker tag "$DOCKER_HUB_USERNAME/$REPO_NAME-frontend:$VERSION" "$DOCKER_HUB_USERNAME/$REPO_NAME-frontend:latest"

# 推送 latest 标签
docker push "$DOCKER_HUB_USERNAME/$REPO_NAME-backend:latest"
docker push "$DOCKER_HUB_USERNAME/$REPO_NAME-frontend:latest"

echo "Docker Hub push completed successfully!"