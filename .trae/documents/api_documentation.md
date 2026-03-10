# 看板应用 API 接口文档

## 1. 概述

本文档描述了看板应用的后端API接口，用于Agent与服务端进行数据交互。这些接口允许Agent实现卡片的创建、读取、更新和删除操作，以及管理卡片的状态。

## 2. 基础信息

- **API基础路径**: `http://localhost:3000/api`
- **内容类型**: `application/json`
- **认证**: 无（MVP阶段）

## 3. 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/cards | 获取所有卡片 |
| POST | /api/cards | 创建新卡片 |
| PUT | /api/cards/:id | 更新卡片 |
| DELETE | /api/cards/:id | 删除卡片 |

## 4. 详细接口说明

### 4.1 GET /api/cards

**描述**: 获取所有卡片列表

**请求参数**: 无

**响应**: 
- **状态码**: 200 OK
- **返回格式**: JSON数组，包含所有卡片对象

**示例响应**:
```json
[
  {
    "_id": "69af8c0fc6fcbe2a44f72817",
    "title": "测试卡片",
    "content": "这是一个测试卡片",
    "status": "TODO",
    "createdAt": "2026-03-10T03:12:15.078Z",
    "updatedAt": "2026-03-10T03:12:15.078Z",
    "__v": 0
  }
]
```

### 4.2 POST /api/cards

**描述**: 创建新卡片

**请求参数**: 
- **Content-Type**: application/json
- **请求体**:
  | 字段 | 类型 | 必填 | 描述 |
  |------|------|------|------|
  | title | string | 是 | 卡片标题 |
  | content | string | 是 | 卡片内容 |
  | status | string | 否 | 卡片状态（默认：TODO） |

**状态枚举**:
- TODO: 待处理
- IN_PROGRESS: 进行中
- DONE: 已完成
- REJECTED: 已拒绝

**响应**: 
- **状态码**: 201 Created
- **返回格式**: JSON对象，包含创建的卡片信息

**示例请求**:
```json
{
  "title": "新任务",
  "content": "这是一个新任务的描述",
  "status": "TODO"
}
```

**示例响应**:
```json
{
  "_id": "69af8c0fc6fcbe2a44f72818",
  "title": "新任务",
  "content": "这是一个新任务的描述",
  "status": "TODO",
  "createdAt": "2026-03-10T03:30:00.000Z",
  "updatedAt": "2026-03-10T03:30:00.000Z",
  "__v": 0
}
```

### 4.3 PUT /api/cards/:id

**描述**: 更新卡片信息

**请求参数**: 
- **路径参数**:
  | 字段 | 类型 | 必填 | 描述 |
  |------|------|------|------|
  | id | string | 是 | 卡片ID |
- **Content-Type**: application/json
- **请求体**:
  | 字段 | 类型 | 必填 | 描述 |
  |------|------|------|------|
  | title | string | 否 | 卡片标题 |
  | content | string | 否 | 卡片内容 |
  | status | string | 否 | 卡片状态 |

**响应**: 
- **状态码**: 200 OK
- **返回格式**: JSON对象，包含更新后的卡片信息

**示例请求**:
```json
{
  "title": "更新的任务",
  "status": "IN_PROGRESS"
}
```

**示例响应**:
```json
{
  "_id": "69af8c0fc6fcbe2a44f72817",
  "title": "更新的任务",
  "content": "这是一个测试卡片",
  "status": "IN_PROGRESS",
  "createdAt": "2026-03-10T03:12:15.078Z",
  "updatedAt": "2026-03-10T03:35:00.000Z",
  "__v": 0
}
```

### 4.4 DELETE /api/cards/:id

**描述**: 删除卡片

**请求参数**: 
- **路径参数**:
  | 字段 | 类型 | 必填 | 描述 |
  |------|------|------|------|
  | id | string | 是 | 卡片ID |

**响应**: 
- **状态码**: 200 OK
- **返回格式**: JSON对象，包含删除成功的消息

**示例响应**:
```json
{
  "message": "Card deleted successfully"
}
```

## 5. 错误处理

| 状态码 | 描述 |
|--------|------|
| 400 | 请求参数错误（例如：缺少必填字段） |
| 404 | 资源不存在（例如：卡片ID不存在） |
| 500 | 服务器内部错误 |

**错误响应格式**:
```json
{
  "error": "错误描述"
}
```

## 6. 数据结构

### 卡片（Card）

| 字段 | 类型 | 描述 |
|------|------|------|
| _id | string | 卡片唯一标识符 |
| title | string | 卡片标题 |
| content | string | 卡片内容 |
| status | string | 卡片状态 |
| createdAt | string | 创建时间（ISO格式） |
| updatedAt | string | 更新时间（ISO格式） |
| __v | number | 版本号 |

### 状态（Status）

| 值 | 描述 |
|-----|------|
| TODO | 待处理 |
| IN_PROGRESS | 进行中 |
| DONE | 已完成 |
| REJECTED | 已拒绝 |

## 7. 使用示例

### 示例1: 获取所有卡片

```javascript
// 使用fetch API
fetch('http://localhost:3000/api/cards')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// 使用axios
axios.get('http://localhost:3000/api/cards')
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));
```

### 示例2: 创建新卡片

```javascript
// 使用fetch API
fetch('http://localhost:3000/api/cards', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: '新任务',
    content: '任务描述',
    status: 'TODO'
  }),
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// 使用axios
axios.post('http://localhost:3000/api/cards', {
  title: '新任务',
  content: '任务描述',
  status: 'TODO'
})
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));
```

### 示例3: 更新卡片

```javascript
// 使用fetch API
fetch('http://localhost:3000/api/cards/69af8c0fc6fcbe2a44f72817', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    status: 'DONE'
  }),
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// 使用axios
axios.put('http://localhost:3000/api/cards/69af8c0fc6fcbe2a44f72817', {
  status: 'DONE'
})
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));
```

### 示例4: 删除卡片

```javascript
// 使用fetch API
fetch('http://localhost:3000/api/cards/69af8c0fc6fcbe2a44f72817', {
  method: 'DELETE',
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// 使用axios
axios.delete('http://localhost:3000/api/cards/69af8c0fc6fcbe2a44f72817')
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));
```

## 8. 注意事项

1. 所有API请求和响应均使用JSON格式
2. 卡片状态必须是预定义的枚举值之一
3. 创建卡片时，title和content为必填字段
4. 更新卡片时，可只更新部分字段
5. 删除卡片时，需要提供有效的卡片ID
6. 所有时间字段均为ISO 8601格式的字符串

## 9. 版本信息

- **API版本**: 1.0.0
- **最后更新**: 2026-03-10
