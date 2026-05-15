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

**IN_PROGRESS**

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
- Card status transitions: TODO → IN_PROGRESS → DONE or REJECTED

## Error Codes

| Error Code              | HTTP Status | Description    | File Location         |
| ----------------------- | ----------- | -------------- | --------------------- |
| VALIDATION_ERROR        | 400         | 参数验证失败   | `src/errors/index.ts` |
| NOT_FOUND               | 404         | 资源不存在     | `src/errors/index.ts` |
| BUSINESS_RULE_VIOLATION | 400         | 业务规则违反   | `src/errors/index.ts` |
| INTERNAL_ERROR          | 500         | 服务器内部错误 | `src/errors/index.ts` |
| UNAUTHORIZED            | 401         | 未授权访问     | `src/errors/index.ts` |

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

| From State  | Allowed Transitions   |
| ----------- | --------------------- |
| TODO        | IN_PROGRESS, REJECTED |
| IN_PROGRESS | TODO, DONE, REJECTED  |
| DONE        | IN_PROGRESS           |
| REJECTED    | TODO                  |

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

| Page | Path | Description |
|------|------|-------------|
| Home | `/` | 首页，显示看板组件 |
| About | `/about` | 关于页，显示版本信息和环境信息 |
| NotFound | `*` | 404 页面，处理未匹配路由 |

### Navigation

- **Global Header**: 顶部导航栏，包含页面切换链接
- **Navigation Links**: 使用 react-router-dom Link 组件实现无刷新页面切换
