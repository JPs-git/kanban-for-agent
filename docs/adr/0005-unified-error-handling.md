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

---

# 前端统一错误处理和通知系统

## 状态

已接受

## 上下文

前端需要统一的异常捕获机制，避免接口报错导致错误页面，通过友好的 Toast 方式提示用户错误信息。

### 问题分析

- API 错误直接导致错误页面，用户体验差
- 错误信息直接暴露原始错误消息，不友好
- 业务规则错误未区分提示样式（应使用黄色警告）
- 拖拽和点击详情更新卡片状态的错误处理逻辑不统一

## 决策

### 1. 前端错误处理架构

```
┌─────────────────────────────────────────────────────────────┐
│  Presentation Layer (UI Components)                        │
│  ├── KanbanBoard.tsx (看板组件)                              │
│  ├── CardModal.tsx (卡片详情弹窗)                            │
│  └── Toast 系统 (ToastContext, Toast)                       │
├─────────────────────────────────────────────────────────────┤
│  Hook Layer                                                  │
│  ├── useKanban.ts (看板数据管理)                             │
│  └── useErrorHandler.ts (统一错误处理 Hook)                  │
├─────────────────────────────────────────────────────────────┤
│  Service Layer                                               │
│  ├── errorHandler.ts (错误处理服务)                          │
│  │   ├── 错误类型定义                                        │
│  │   ├── 错误映射表                                          │
│  │   └── 业务规则映射                                        │
│  └── api.ts (API 调用)                                      │
├─────────────────────────────────────────────────────────────┤
│  Context Layer                                               │
│  └── ToastContext (Toast 状态管理)                          │
└─────────────────────────────────────────────────────────────┘
```

### 2. 错误类型定义

定义前端错误类型和分类：

```typescript
export type ErrorCategory = 'validation' | 'not_found' | 'business_rule' | 'internal' | 'unknown';

export interface FrontendError {
  code: string;
  message: string;
  category: ErrorCategory;
  details?: Record<string, any>;
  timestamp?: string;
}

export type BusinessRuleCode = 
  | 'INVALID_STATUS_TRANSITION'
  | 'CARD_NOT_TRANSITIONABLE_TO_REJECTED'
  | 'CARD_MUST_BE_STARTED_BEFORE_COMPLETION'
  | 'CARD_CANNOT_BE_REOPENED';
```

### 3. 错误映射表

将后端错误码映射为前端友好的错误消息：

```typescript
export const errorMappings: Record<string, { message: string; category: ErrorCategory }> = {
  'VALIDATION_ERROR': {
    message: '参数验证失败',
    category: 'validation'
  },
  'NOT_FOUND': {
    message: '请求的资源不存在',
    category: 'not_found'
  },
  'BUSINESS_RULE_VIOLATION': {
    message: '业务规则冲突',
    category: 'business_rule'
  },
  'INTERNAL_ERROR': {
    message: '服务器内部错误',
    category: 'internal'
  },
  'UNAUTHORIZED': {
    message: '未授权访问',
    category: 'internal'
  }
};
```

### 4. 业务规则映射表

将业务规则代码映射为中文提示：

```typescript
export const businessRuleMappings: Record<BusinessRuleCode, string> = {
  INVALID_STATUS_TRANSITION: '状态转换不合法',
  CARD_NOT_TRANSITIONABLE_TO_REJECTED: '已完成的任务不能拒绝!',
  CARD_MUST_BE_STARTED_BEFORE_COMPLETION: '任务必须先开始才能完成',
  CARD_CANNOT_BE_REOPENED: '已开始的任务不能重新打开',
};
```

### 5. Toast 通知系统

#### 5.1 Toast 类型和样式

根据错误类别显示不同颜色的 Toast：

| Toast 类型 | 颜色 | 用途 | 持续时间 |
|-----------|------|------|---------|
| `error` | 红色 | 错误提示（验证错误、资源不存在、内部错误） | 4000ms |
| `warning` | 黄色/橙色 | 业务规则警告 | 5000ms |
| `success` | 绿色 | 成功提示 | 3000ms |
| `info` | 蓝色 | 信息提示 | 3000ms |

#### 5.2 Toast Context 架构

为解决 React Fast Refresh 的上下文混合问题，采用多文件架构：

```
src/context/
├── ToastContext.tsx          # 主入口，组合 Provider
├── ToastContext.types.ts     # 类型定义
├── ToastContext.context.ts   # Context 创建和导出
└── ToastContext.Provider.tsx # Provider 实现
```

#### 5.3 Toast 组件特性

- 顶部中央固定位置显示
- 最多同时显示 3 条 Toast
- 自动按顺序消失（先进先出）
- 支持平滑的滑入/滑出动画
- 支持手动关闭

### 6. useErrorHandler Hook

统一错误处理 Hook，自动处理 API 错误并显示 Toast：

```typescript
export const useErrorHandler = () => {
  const { showToast } = useToast();

  const handleError = (error: any, defaultMessage?: string) => {
    // 1. 解析错误响应
    const { code, message, details } = parseApiError(error);
    
    // 2. 根据错误类别显示 Toast
    if (category === 'business_rule') {
      // 业务规则错误使用黄色警告
      showToast(message, 'warning');
    } else {
      // 其他错误使用红色错误提示
      showToast(message, 'error');
    }
    
    // 3. 记录错误日志
    console.error('API Error:', error);
  };

  return { handleError };
};
```

### 7. 统一卡片状态更新逻辑

确保拖拽和点击详情更新卡片状态的逻辑一致：

#### 7.1 问题

- 拖拽卡片：直接调用 API，成功后本地更新状态
- 点击详情：先调用 API，再重新获取整个列表

#### 7.2 解决方案

统一使用 `useKanban` Hook 提供的 `updateCard` 方法：

```typescript
// KanbanBoard.tsx - 拖拽更新
const handleDragEnd = async (cardId: string, newStatus: string) => {
  try {
    await updateCard(cardId, { status: newStatus });
    showToast('卡片状态已更新', 'success');
  } catch (error) {
    handleError(error, '更新卡片状态失败');
    // 刷新卡片以恢复原状态
    refreshCards();
  }
};

// CardModal.tsx - 详情更新
const handleSave = async (cardId: string, updates: Partial<Card>) => {
  try {
    await updateCard(cardId, updates);
    showToast('卡片已更新', 'success');
  } catch (error) {
    handleError(error, '更新卡片失败');
  }
};
```

## 理由

1. **用户体验**：避免错误页面，通过 Toast 提供友好提示
2. **一致性**：统一的错误处理逻辑，减少代码重复
3. **可维护性**：集中管理错误映射，便于扩展和修改
4. **视觉区分**：业务规则错误使用黄色警告，区分不同类型的错误
5. **开发者体验**：Hook 封装简化错误处理逻辑

## 影响

### 文件结构

| 文件 | 描述 |
|------|------|
| `frontend/src/services/errorHandler.ts` | 错误类型定义、错误映射、业务规则映射 |
| `frontend/src/hooks/useErrorHandler.ts` | 统一错误处理 Hook |
| `frontend/src/context/ToastContext.tsx` | Toast Context 主入口 |
| `frontend/src/context/ToastContext.types.ts` | Toast Context 类型定义 |
| `frontend/src/context/ToastContext.context.ts` | Context 创建和导出 |
| `frontend/src/context/ToastContext.Provider.tsx` | Toast Provider 实现 |
| `frontend/src/context/ToastContext.hook.ts` | useToast Hook 实现 |
| `frontend/src/components/Toast.tsx` | Toast 组件 |
| `frontend/src/components/KanbanBoard.tsx` | 统一卡片更新逻辑 |
| `frontend/src/hooks/useKanban.ts` | 使用 useErrorHandler |

### API 错误响应格式

后端返回的错误格式：

```json
{
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "Invalid status transition",
    "details": {
      "field": "status",
      "reason": "business_rule_violation",
      "ruleCode": "CARD_NOT_TRANSITIONABLE_TO_REJECTED"
    },
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### 前端错误处理流程

```
API Response
    ↓
check error.response
    ↓
parseApiError(error)
    ↓
get error info (code, message, details, ruleCode)
    ↓
check if business_rule
    ├─ YES → show warning Toast (yellow)
    └─ NO  → show error Toast (red)
    ↓
log error for debugging
```

## 替代方案

- **错误页面**：每个错误都跳转到错误页面（用户体验差）
- **Alert 组件**：使用页面内 Alert（不够优雅，影响布局）
- **console.log**：只打印到控制台（用户无法感知错误）

## 后续工作

- [ ] 添加错误监控和上报机制
- [ ] 支持错误重试机制
- [ ] 添加离线错误队列
- [ ] 实现错误边界（Error Boundary）
- [ ] 添加国际化错误消息支持