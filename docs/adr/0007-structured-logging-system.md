# 0007 - 结构化日志系统

## 状态

已接受

## 上下文

项目需要增强日志功能以提高可观测性，解决以下问题：

1. 生产环境进程意外退出时缺少足够的诊断信息
2. `kanban logs` 命令无法显示进程启动/退出等关键事件
3. 日志格式不一致，难以进行自动化分析和监控
4. 需要支持前台运行模式，终端实时显示日志

## 决策

### 1. 日志格式

采用 **JSON Lines** 格式作为标准日志输出格式：

```json
{
"timestamp": "2026-05-16T08:21:54.515Z",
"level": "INFO",
"event": "PROCESS_START",
"message": "Starting Kanban backend",
"pid": 20640,
"env": "production",
"version": "0.8.10"
}
```

**字段说明**：

| 字段 | 类型 | 必选 | 说明 |
|------|------|------|------|
| `timestamp` | string | 是 | ISO 8601 格式时间戳 |
| `level` | string | 是 | 日志级别：DEBUG/INFO/WARN/ERROR |
| `event` | string | 否 | 事件类型标识 |
| `message` | string | 是 | 日志消息 |
| `pid` | number | 是 | 进程ID |
| `env` | string | 是 | 运行环境 |
| `stack` | string | 否 | 错误堆栈（仅 ERROR 级别） |
| `[extra]` | any | 否 | 额外上下文信息 |

### 2. 日志级别

| 级别 | 用途 | 适用场景 |
|------|------|----------|
| `DEBUG` | 详细调试信息 | 开发环境、问题排查 |
| `INFO` | 系统操作信息 | 生产环境默认级别 |
| `WARN` | 潜在问题警告 | 可恢复的异常情况 |
| `ERROR` | 严重错误 | 需要立即处理的问题 |

### 3. 进程生命周期事件捕获

捕获以下关键进程事件：

| 事件 | 触发时机 | 级别 |
|------|----------|------|
| `PROCESS_START` | 进程启动 | INFO |
| `PROCESS_EXIT` | 进程退出 | INFO |
| `PROCESS_UNCAUGHT_EXCEPTION` | 未捕获异常 | ERROR |
| `PROCESS_UNHANDLED_REJECTION` | Promise 拒绝 | ERROR |
| `PROCESS_SIGTERM` | SIGTERM 信号 | INFO |
| `PROCESS_SIGINT` | SIGINT 信号 | INFO |
| `DB_CONNECT` | 数据库连接开始 | INFO |
| `DB_CONNECT_SUCCESS` | 数据库连接成功 | INFO |
| `SERVER_LISTENING` | 服务器开始监听 | INFO |
| `STARTUP_ERROR` | 启动失败 | ERROR |

### 4. 日志输出目标

- **Console**: 实时输出到终端（前台运行模式）
- **File**: 持久化到 `backend/logs/backend.log`

### 5. 日志工具实现

创建统一的日志工具类 `Logger`：

```typescript
export class Logger {
private logFile: fs.WriteStream;
private logLevel: LogLevel;

info(event: string, message: string, extra?: Record<string, unknown>);
error(event: string, message: string, extra?: Record<string, unknown>);
warn(event: string, message: string, extra?: Record<string, unknown>);
debug(event: string, message: string, extra?: Record<string, unknown>);
}
```

### 6. CLI 运行模式

支持两种运行模式（通过 `foreground` 选项控制）：

| 模式 | 说明 | 日志输出 |
|------|------|----------|
| 前台模式 | 阻塞终端运行 | 终端 + 文件 |
| 后台模式 | 守护进程运行 | 文件 |

## 理由

1. **可观测性**：JSON Lines 格式便于自动化分析、监控告警和日志聚合
2. **可追踪性**：进程生命周期事件帮助定位启动失败和意外退出问题
3. **灵活性**：日志级别支持开发和生产环境的不同需求
4. **用户体验**：前台运行模式让用户可以实时看到系统状态
5. **兼容性**：同时支持终端和文件输出，兼顾实时查看和历史追溯

## 影响

### 文件结构

| 文件 | 描述 |
|------|------|
| `backend/src/utils/logger.ts` | 统一日志工具类 |
| `backend/src/server.ts` | 添加进程生命周期日志 |
| `backend/src/config/sqlite.ts` | 添加数据库连接日志 |
| `backend/src/middleware/logger.ts` | HTTP 请求日志 |
| `kanban-cli/src/services/process_manager.js` | 前台运行模式支持 |
| `kanban-cli/src/utils/logger.js` | CLI 日志工具 |

### 使用方式

**后端日志示例**：

```typescript
import { logger } from './utils/logger.js';

logger.info('PROCESS_START', 'Starting Kanban backend', {
version,
nodeVersion: process.version
});
```

**CLI 启动**：

```bash
kanban start  # 前台模式（默认）
kanban start --background  # 后台模式（未来扩展）
```

## 替代方案

| 方案 | 优点 | 缺点 |
|------|------|------|
| 纯文本日志 | 简单、易读 | 难以自动化分析 |
| 第三方日志库（Winston/Pino） | 功能丰富 | 增加依赖复杂度 |
| 仅文件输出 | 轻量 | 无法实时查看 |

## 后续工作

- [ ] 添加日志轮换机制
- [ ] 支持 `kanban logs --follow` 实时查看
- [ ] 考虑引入结构化日志库（如 Pino）
- [ ] 添加请求追踪 ID 支持
- [ ] 实现日志级别动态调整