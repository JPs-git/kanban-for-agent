# 多阶段构建：第一阶段 - 依赖安装和构建
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建 TypeScript 代码
RUN npm run build

# 多阶段构建：第二阶段 - 运行时
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 从构建阶段复制构建结果和依赖
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# 安装生产依赖（不包含开发依赖）
RUN npm install --only=production

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]