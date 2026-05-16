# Kanban Board Domain Context

## Domain Vocabulary

### Core Entities

**Card**

- A work item or task represented on the kanban board
- Properties: id (UUID), title, content, status, assignee, assigneeName, createdAt, updatedAt

**User**

- A person who can be assigned to cards
- Properties: id (UUID), name, createdAt, updatedAt

### Status States

**TODO**

- Initial state when a card is created
- Represents work that needs to be done

**IN\_PROGRESS**

- Card is currently being worked on
- Assigned to a user

**DONE**

- Card has been completed successfully

**REJECTED**

- Card has been discarded or declined

### Relationships

- A Card may have zero or one Assignee (User)
- A User may be assigned to zero or many Cards

### Business Rules

- Cards are created with a default status of TODO
- Cards must have a unique UUID identifier
- Card status transitions: TODO → IN\_PROGRESS → DONE or REJECTED

## Error Codes

| Error Code                | HTTP Status | Description | File Location         |
| ------------------------- | ----------- | ----------- | --------------------- |
| VALIDATION\_ERROR         | 400         | 参数验证失败      | `src/errors/index.ts` |
| NOT\_FOUND                | 404         | 资源不存在       | `src/errors/index.ts` |
| BUSINESS\_RULE\_VIOLATION | 400         | 业务规则违反      | `src/errors/index.ts` |
| INTERNAL\_ERROR           | 500         | 服务器内部错误     | `src/errors/index.ts` |
| UNAUTHORIZED              | 401         | 未授权访问       | `src/errors/index.ts` |

## Frontend Error Handling

### Error Categories

前端错误按类别分为不同的处理方式：

| Category        | Description | Toast Type | Duration |
| --------------- | ----------- | ---------- | -------- |
| `validation`    | 参数验证失败      | error      | 4000ms   |
| `not_found`     | 资源不存在       | error      | 4000ms   |
| `business_rule` | 业务规则违反      | warning    | 5000ms   |
| `internal`      | 服务器内部错误     | error      | 4000ms   |
| `unknown`       | 未知错误        | error      | 4000ms   |

### Business Rule Codes

业务规则错误使用唯一的 ruleCode 进行标识：

| Rule Code                                | Message      | File Location                  |
| ---------------------------------------- | ------------ | ------------------------------ |
| `INVALID_STATUS_TRANSITION`              | 状态转换不合法      | `src/services/errorHandler.ts` |
| `CARD_NOT_TRANSITIONABLE_TO_REJECTED`    | 已完成的任务不能拒绝!  | `src/services/errorHandler.ts` |
| `CARD_MUST_BE_STARTED_BEFORE_COMPLETION` | 任务必须先开始才能完成  | `src/services/errorHandler.ts` |
| `CARD_CANNOT_BE_REOPENED`                | 已开始的任务不能重新打开 | `src/services/errorHandler.ts` |

### Toast Notification System

#### Architecture

为解决 React Fast Refresh 的上下文混合问题，采用多文件架构：

```
src/context/
├── ToastContext.tsx           # 主入口，组合 Provider
├── ToastContext.types.ts      # 类型定义
├── ToastContext.context.ts    # Context 创建和导出
├── ToastContext.Provider.tsx  # Provider 实现
├── ToastContext.hook.ts       # useToast Hook 实现
└── ToastContext.Consumer.tsx  # Consumer 组件
```

#### Features

- 顶部中央固定位置显示
- 最多同时显示 3 条 Toast
- 自动按顺序消失（先进先出）
- 支持平滑的滑入/滑出动画
- 支持手动关闭

#### Toast Types

| Type    | Color | Purpose |
| ------- | ----- | ------- |
| error   | 红色    | 错误提示    |
| warning | 黄色    | 业务规则警告  |
| success | 绿色    | 成功提示    |
| info    | 蓝色    | 信息提示    |

### Error Handling Hooks

#### useErrorHandler

统一错误处理 Hook，自动处理 API 错误并显示 Toast：

**Location**: `frontend/src/hooks/useErrorHandler.ts`

**Usage**:

```typescript
const { handleError } = useErrorHandler();

// 在 catch 块中调用
try {
  await updateCard(cardId, updates);
} catch (error) {
  handleError(error, '更新卡片失败');
}
```

#### useKanban

看板数据管理 Hook，整合了错误处理：

**Location**: `frontend/src/hooks/useKanban.ts`

**Features**:

- 自动显示 Toast 通知
- 业务规则错误使用警告样式
- 其他错误使用错误样式
- 错误后自动刷新卡片列表

### Error Handling Flow

```
User Action
    ↓
API Request
    ↓
Backend Response
    ├─ Success → Update Local State → Show Success Toast
    └─ Error → parseApiError() → determineCategory()
        ↓
        check category
        ├─ business_rule → show warning Toast (yellow)
        └─ other → show error Toast (red)
        ↓
        log error for debugging
```

### File Structure

| File                                         | Description        |
| -------------------------------------------- | ------------------ |
| `frontend/src/services/errorHandler.ts`      | 错误类型定义、错误映射、业务规则映射 |
| `frontend/src/hooks/useErrorHandler.ts`      | 统一错误处理 Hook        |
| `frontend/src/context/ToastContext.tsx`      | Toast Context 主入口  |
| `frontend/src/context/ToastContext.types.ts` | Toast Context 类型定义 |
| `frontend/src/components/Toast.tsx`          | Toast 组件           |
| `frontend/src/hooks/useKanban.ts`            | 看板数据管理（含错误处理集成）    |
| `frontend/src/components/KanbanBoard.tsx`    | 看板组件（统一卡片更新逻辑）     |

### API Error Response Format

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

## Architecture Layers

### Layered Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Presentation Layer                                         │
│  ├── Routes (`src/routes/`)                                │
│  │   ├── cardRoutes.ts                                     │
│  │   └── userRoutes.ts                                     │
│  └── Controllers (`src/controllers/`)                      │
│      ├── cardController.ts                                  │
│      └── userController.ts                                 │
├─────────────────────────────────────────────────────────────┤
│  Service Layer                                              │
│  ├── CardService (`src/services/CardService.ts`)           │
│  ├── UserService (`src/services/UserService.ts`)           │
│  └── Business Rules Validation                             │
├─────────────────────────────────────────────────────────────┤
│  Repository Layer                                          │
│  ├── Interfaces (`src/repositories/`)                      │
│  │   ├── CardRepository.ts                                 │
│  │   └── UserRepository.ts                                 │
│  └── SQLite Implementations                                │
│      ├── SQLiteCardRepository.ts                           │
│      └── SQLiteUserRepository.ts                           │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                 │
│  ├── Models (`src/models/`)                                │
│  │   ├── Card.ts                                           │
│  │   └── User.ts                                           │
│  └── Database Config (`src/config/`)                       │
│      ├── db.ts                                             │
│      ├── sqlite.ts                                         │
│      └── migration.ts                                      │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer        | Responsibilities                              |
| ------------ | --------------------------------------------- |
| Presentation | Handle HTTP requests/responses, routing       |
| Service      | Business logic, validation, state transitions |
| Repository   | Data access abstraction, CRUD operations      |
| Data         | Database configuration, models, migrations    |

## Status Transition Rules

| From State   | Allowed Transitions    |
| ------------ | ---------------------- |
| TODO         | IN\_PROGRESS, REJECTED |
| IN\_PROGRESS | DONE, REJECTED        |
| DONE         | IN\_PROGRESS           |
| REJECTED     | TODO                  |

**Note**: 更新卡片时，如果状态保持不变（如 TODO → TODO），则不受状态转换规则限制，允许直接更新。

## Utility Functions

| Function                 | Location               | Purpose                          |
| ------------------------ | ---------------------- | -------------------------------- |
| `getParam`               | `src/utils/request.ts` | Safely get route parameters      |
| `getQueryParam`          | `src/utils/request.ts` | Safely get query parameters      |
| `validateRequiredFields` | `src/utils/request.ts` | Validate required request fields |

## Middleware

| Middleware     | Location                         | Purpose                    |
| -------------- | -------------------------------- | -------------------------- |
| `errorHandler` | `src/middleware/errorHandler.ts` | Centralized error handling |
| `logger`       | `src/middleware/logger.ts`       | Request logging            |

## Context Boundary

This context manages:

- Card creation, update, deletion
- User management
- Task assignment
- Status transitions

External integrations:

- SQLite database for persistence
- REST API for frontend communication
- CLI tool for deployment and management

## Frontend Routing

### Pages

| Page     | Path     | Description     |
| -------- | -------- | --------------- |
| Home     | `/`      | 首页，显示看板组件       |
| About    | `/about` | 关于页，显示版本信息和环境信息 |
| NotFound | `*`      | 404 页面，处理未匹配路由  |

### Navigation

- **Global Header**: 顶部导航栏，包含页面切换链接
- **Navigation Links**: 使用 react-router-dom Link 组件实现无刷新页面切换

