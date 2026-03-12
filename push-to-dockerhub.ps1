# Docker Hub 仓库信息
$DOCKER_HUB_USERNAME = "<your-dockerhub-username>"
$REPO_NAME = "kanban"

# 从参数获取版本号，如果没有提供则使用默认值
if ($args.Length -gt 0) {
    if ($args[0] -eq "--help" -or $args[0] -eq "-h") {
        Write-Host "Usage: .\push-to-dockerhub.ps1 [version]"
        Write-Host "Example: .\push-to-dockerhub.ps1 1.0.0"
        exit
    }
    $VERSION = $args[0]
} else {
    $VERSION = "1.0.0"
}

Write-Host "Using version: $VERSION"

# 构建后端镜像
Write-Host "Building backend image..."
docker build -t "$DOCKER_HUB_USERNAME/$REPO_NAME-backend:$VERSION" ./backend

# 构建前端镜像
Write-Host "Building frontend image..."
docker build -t "$DOCKER_HUB_USERNAME/$REPO_NAME-frontend:$VERSION" ./frontend

# 推送后端镜像
Write-Host "Pushing backend image to Docker Hub..."
docker push "$DOCKER_HUB_USERNAME/$REPO_NAME-backend:$VERSION"

# 推送前端镜像
Write-Host "Pushing frontend image to Docker Hub..."
docker push "$DOCKER_HUB_USERNAME/$REPO_NAME-frontend:$VERSION"

# 添加标签 latest
Write-Host "Adding latest tags..."
docker tag "$DOCKER_HUB_USERNAME/$REPO_NAME-backend:$VERSION" "$DOCKER_HUB_USERNAME/$REPO_NAME-backend:latest"
docker tag "$DOCKER_HUB_USERNAME/$REPO_NAME-frontend:$VERSION" "$DOCKER_HUB_USERNAME/$REPO_NAME-frontend:latest"

# 推送 latest 标签
docker push "$DOCKER_HUB_USERNAME/$REPO_NAME-backend:latest"
docker push "$DOCKER_HUB_USERNAME/$REPO_NAME-frontend:latest"

Write-Host "Docker Hub push completed successfully!"