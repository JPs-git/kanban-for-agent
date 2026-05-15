# 0004 - 采用仓储模式

## 状态

已接受

## 上下文

为了实现数据访问层与业务逻辑的解耦，需要引入仓储模式来抽象数据库操作。

### 问题分析

- 控制器直接调用数据库查询，业务逻辑与数据访问耦合
- 难以进行单元测试（需要真实数据库）
- 更换数据库实现需要修改大量代码

## 决策

采用仓储模式（Repository Pattern），定义抽象接口和具体实现：

### 接口定义

| 接口 | 方法 | 功能 |
|------|------|------|
| `CardRepository` | `find()` | 查询所有卡片 |
| | `findById(uuid)` | 根据UUID查询卡片 |
| | `create(cardData)` | 创建新卡片 |
| | `update(uuid, updateData)` | 更新卡片 |
| | `delete(uuid)` | 删除卡片 |
| `UserRepository` | `find()` | 查询所有用户 |
| | `findById(uuid)` | 根据UUID查询用户 |
| | `create(userData)` | 创建新用户 |
| | `update(uuid, updateData)` | 更新用户 |
| | `delete(uuid)` | 删除用户 |

### 实现层次

```
CardRepository (抽象类)
    ↓
SQLiteCardRepository (SQLite实现)
    ↓
SQLite Database
```

## 理由

1. **解耦业务逻辑与数据访问**：服务层依赖抽象接口，不依赖具体实现
2. **提高可测试性**：可以轻松Mock仓储接口进行单元测试
3. **便于切换数据库**：只需实现新的仓储类即可更换数据库
4. **统一数据访问接口**：所有数据操作通过统一接口进行

## 影响

### 文件结构

| 文件 | 描述 |
|------|------|
| `src/repositories/CardRepository.ts` | 卡片仓储抽象类 |
| `src/repositories/UserRepository.ts` | 用户仓储抽象类 |
| `src/repositories/SQLiteCardRepository.ts` | SQLite卡片仓储实现 |
| `src/repositories/SQLiteUserRepository.ts` | SQLite用户仓储实现 |
| `src/repositories/index.ts` | 导出所有仓储 |

### 依赖注入

服务层通过构造函数注入仓储实例：

```typescript
class CardService {
  constructor(private cardRepository: CardRepository) {}
}
```

## 替代方案

- **直接数据库访问**：简单但耦合度高
- **Active Record模式**：将数据访问逻辑放在模型中（适合简单场景）

## 后续工作

- 考虑引入依赖注入容器管理仓储实例
- 添加更多仓储实现（如内存仓储用于测试）