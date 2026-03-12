# 看板项目容器化部署文档

## 项目概述
- 项目类型：全栈应用（前端 + 后端）
- 技术栈：
  - 前端：React + TypeScript + Vite
  - 后端：Express + MongoDB + TypeScript
  - 数据库：MongoDB

## 部署环境
- 开发环境 (development)
- 测试环境 (test)
- 生产环境 (production)

## 准备工作
1. 安装 Docker 和 Docker Compose
2. 注册 Docker Hub 账号（用于推送镜像）
3. 确保项目代码已准备就绪

## 部署步骤

### 1. 开发环境部署

**步骤：**
1. 进入项目根目录
2. 启动开发环境：
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```
3. 访问应用：
   - 前端：http://localhost:8080
   - 后端 API：http://localhost:3000

**开发环境特点：**
- 启用了代码热重载，修改代码后会自动更新
- MongoDB 数据存储在本地卷中
- 所有服务都在开发模式下运行

### 2. 测试环境部署

**步骤：**
1. 进入项目根目录
2. 启动测试环境：
   ```bash
   docker-compose -f docker-compose.test.yml up -d
   ```
3. 运行测试：
   ```bash
   # 进入后端容器运行测试
   docker exec -it kanban-backend-test npm test
   ```

**测试环境特点：**
- 使用独立的测试数据库
- 端口与开发环境分离，避免冲突
- 适用于 CI/CD 流程中的自动化测试

### 3. 生产环境部署

**步骤：**
1. 进入项目根目录
2. 配置生产环境变量：
   ```bash
   cp .env.production.example .env.production
   # 编辑 .env.production 文件，填写实际的 MongoDB 连接信息
   ```
3. 启动生产环境：
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```
4. 访问应用：
   - 前端：http://localhost
   - 后端 API：http://localhost:3002

**生产环境特点：**
- 使用正式的 MongoDB 连接配置
- 启用了资源限制，提高安全性和性能
- 配置了自动重启，确保服务稳定性

## Docker Hub 推送

**步骤（Linux/macOS）：**
1. 编辑 `push-to-dockerhub.sh` 文件，填写你的 Docker Hub 用户名
2. 赋予脚本执行权限：
   ```bash
   chmod +x push-to-dockerhub.sh
   ```
3. 登录 Docker Hub：
   ```bash
   docker login
   ```
4. 运行推送脚本（可选指定版本）：
   ```bash
   # 使用默认版本
   ./push-to-dockerhub.sh
   # 指定版本
   ./push-to-dockerhub.sh 1.0.0
   ```

**步骤（Windows）：**
1. 编辑 `push-to-dockerhub.ps1` 文件，填写你的 Docker Hub 用户名
2. 登录 Docker Hub：
   ```powershell
   docker login
   ```
3. 运行推送脚本（可选指定版本）：
   ```powershell
   # 使用默认版本
   .\push-to-dockerhub.ps1
   # 指定版本
   .\push-to-dockerhub.ps1 1.0.0
   ```

**镜像标签说明：**
- 版本标签：如 `1.0.0`
- 最新标签：`latest`

## 环境变量配置

### 开发环境
- 文件：`backend/.env.development`
- 配置项：
  - `NODE_ENV=development`
  - `MONGODB_URI=mongodb://mongo:27017/kanban`
  - `PORT=3000`

### 测试环境
- 文件：`backend/.env.test`
- 配置项：
  - `NODE_ENV=test`
  - `MONGODB_TEST_URI=mongodb://mongo:27017/kanban-test`
  - `PORT=3000`

### 生产环境
- 文件：`.env.production`（需从 `.env.production.example` 复制并填写）
- 配置项：
  - `MONGODB_URI`：MongoDB 连接字符串
  - `MONGO_ROOT_USER`：MongoDB 根用户名
  - `MONGO_ROOT_PASSWORD`：MongoDB 根密码

## 常见问题及解决方案

### 1. MongoDB 连接失败
**解决方案：**
- 检查 MongoDB 服务是否正常运行
- 验证 MongoDB 连接字符串是否正确
- 确保网络配置正确，容器之间可以相互通信

### 2. 前端无法访问后端 API
**解决方案：**
- 检查后端服务是否正常运行
- 验证前端 API 调用地址是否正确
- 确保 CORS 配置正确

### 3. 镜像构建失败
**解决方案：**
- 检查依赖是否正确安装
- 验证 Dockerfile 配置是否正确
- 确保网络连接正常，能够下载所需的基础镜像

### 4. 容器启动失败
**解决方案：**
- 查看容器日志：`docker logs <container-name>`
- 检查环境变量配置是否正确
- 确保端口没有被占用

## 监控和维护

### 查看容器状态
```bash
docker-compose -f <docker-compose-file> ps
```

### 查看容器日志
```bash
docker-compose -f <docker-compose-file> logs <service-name>
```

### 停止和重启服务
```bash
# 停止服务
docker-compose -f <docker-compose-file> down

# 重启服务
docker-compose -f <docker-compose-file> restart
```

### 备份数据
```bash
# 备份 MongoDB 数据
docker exec -it <mongo-container-name> mongodump --out /backup
```

## 升级和回滚

### 升级服务
1. 更新代码或配置
2. 重新构建镜像：
   ```bash
   docker-compose -f <docker-compose-file> build
   ```
3. 重启服务：
   ```bash
   docker-compose -f <docker-compose-file> up -d
   ```

### 回滚服务
1. 停止当前服务：
   ```bash
   docker-compose -f <docker-compose-file> down
   ```
2. 使用之前的镜像版本启动服务：
   ```bash
   docker-compose -f <docker-compose-file> up -d
   ```

## 注意事项

1. **安全性：**
   - 生产环境中不要硬编码敏感信息
   - 定期更新基础镜像以修复安全漏洞
   - 配置适当的网络隔离

2. **性能：**
   - 根据实际需求调整容器资源限制
   - 配置 Nginx 缓存以提高前端性能
   - 优化 MongoDB 配置

3. **可靠性：**
   - 配置自动重启策略
   - 定期备份数据
   - 监控服务健康状态

## 总结

本部署方案使用 Docker 和 Docker Compose 实现了项目的容器化部署，支持开发、测试和生产三个环境。通过合理的配置和优化，确保了应用的安全性、性能和可靠性。

如需进一步定制或扩展部署方案，可以根据实际需求调整配置文件和脚本。