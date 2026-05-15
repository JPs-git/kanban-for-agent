# 0005 - 统一错误处理和日志系统

## 状态

已接受

## 上下文

项目需要统一的错误处理机制和请求日志记录，以提高系统的可观测性和错误追踪能力。

### 问题分析

- 错误处理逻辑分散在各个控制器中
- 错误响应格式不一致
- 缺乏统一的错误码体系
- 没有集中的请求日志记录

## 决策

### 1. 统一错误类体系

创建层次化的错误类继承结构：

```
AppError (基类)
    ├── ValidationError (参数验证错误)
    ├── NotFoundError (资源不存在)
    ├── BusinessRuleError (业务规则违反)
    ├── UnauthorizedError (未授权)
    └── InternalError (内部错误)
```

### 2. 错误响应格式

统一的错误响应结构：

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": {
      "field": "title",
      "reason": "must not be empty"
    },
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### 3. 错误码定义

| 错误码 | HTTP状态码 | 描述 |
|--------|-----------|------|
| `VALIDATION_ERROR` | 400 | 参数验证失败 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `BUSINESS_RULE_VIOLATION` | 400 | 业务规则违反 |
| `UNAUTHORIZED` | 401 | 未授权访问 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |

### 4. 错误处理中间件

创建统一的错误处理中间件，捕获所有异常并返回统一格式的响应：

```typescript
errorHandler(err, req, res, next) {
  // 记录错误日志
  console.error('Error:', error);
  
  // 返回统一格式响应
  if (error instanceof AppError) {
    res.status(error.httpStatus).json({ error: error.toJSON() });
  } else {
    res.status(500).json({ error: new InternalError().toJSON() });
  }
}
```

### 5. 请求日志中间件

创建请求日志中间件，记录所有 HTTP 请求：

```typescript
logger(req, res, next) {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} ${res.statusCode} ${duration}ms - ${ip}`);
  });
  
  next();
}
```

## 理由

1. **一致性**：所有错误响应格式统一，便于前端处理
2. **可追踪性**：错误码和详细信息便于问题定位
3. **安全性**：生产环境隐藏内部错误细节
4. **可观测性**：请求日志帮助监控和分析系统行为
5. **集中管理**：错误处理逻辑集中，便于维护和扩展

## 影响

### 文件结构

| 文件 | 描述 |
|------|------|
| `src/errors/index.ts` | 自定义错误类定义 |
| `src/middleware/errorHandler.ts` | 统一错误处理中间件 |
| `src/middleware/logger.ts` | 请求日志中间件 |
| `src/middleware/index.ts` | 导出所有中间件 |

### 使用方式

服务层抛出错误：

```typescript
if (!cardData.title) {
  throw new ValidationError('Title is required', { field: 'title', reason: 'must not be empty' });
}
```

## 替代方案

- **分散处理**：每个控制器自己处理错误（不一致且难以维护）
- **第三方日志库**：如 Winston、Pino（增加依赖复杂度）

## 后续工作

- 添加错误监控和告警机制
- 考虑引入结构化日志库
- 添加请求追踪ID支持