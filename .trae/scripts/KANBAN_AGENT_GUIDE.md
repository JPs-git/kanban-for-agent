# 看板API智能体使用指南

## 快速开始

### 1. 导入脚本

```python
# 方式1: 使用类式API (功能完整)
from kanban_api_client import KanbanAPI

kanban = KanbanAPI()
```

```python
# 方式2: 使用函数式API (简洁快速)
from kanban_api_simple import (
    get_cards, create_card, update_card,
    find_cards_by_assignee, set_status,
    create_report_for_starbow
)
```

---

## 常用操作速查

### 查询卡片

```python
# 获取所有卡片
cards = get_cards()

# 获取Claw的TODO任务
claw_todo = find_cards_by_assignee(
    assignee_name="Claw",
    status="TODO"
)

# 获取所有进行中的任务
in_progress = find_cards_by_status("IN_PROGRESS")
```

### 创建卡片

```python
# 创建任务卡片
card = create_card(
    title="请确认",
    content="任务已完成，请确认",
    status="TODO",
    assignee="starbow",
    assignee_name="Starbow"
)

# 获取新卡片ID
new_card_id = card['_id']
```

### 更新卡片

```python
# 更新状态
set_status(card_id, "IN_PROGRESS")  # 开始处理
set_status(card_id, "DONE")          # 完成

# 批量更新
update_card(card_id, 
    title="新标题",
    content="新内容",
    status="DONE"
)
```

### 删除卡片

```python
delete_card(card_id)
```

---

## 智能体工作流模板

### 模板1: 处理TODO任务

```python
def handle_todo_tasks():
    # 1. 获取TODO任务
    todo_cards = find_cards_by_assignee(
        assignee_name="Claw",
        status="TODO"
    )
    
    for card in todo_cards:
        card_id = card['_id']
        title = card['title']
        content = card['content']
        
        # 2. 更新为进行中
        set_status(card_id, "IN_PROGRESS")
        
        # 3. 执行任务
        # ... 根据title和content执行相应操作 ...
        
        # 4. 任务完成，更新为DONE
        set_status(card_id, "DONE")
```

### 模板2: 检查进行中的任务

```python
def check_in_progress():
    # 获取进行中的任务
    progress_cards = find_cards_by_assignee(
        assignee_name="Claw",
        status="IN_PROGRESS"
    )
    
    for card in progress_cards:
        # 检查任务是否完成
        if task_is_complete(card):
            set_status(card['_id'], "DONE")
        else:
            # 创建进度报告
            create_report_for_starbow(
                title=f"任务进度: {card['title']}",
                content="任务还在进行中，预计还需..."
            )
```

### 模板3: 需要用户确认时

```python
def need_user_confirmation(task_result):
    # 创建确认卡片给Starbow
    create_card(
        title="请确认: 任务执行结果",
        content=f"""
任务执行完成，结果如下:
{task_result}

请确认是否满意，或需要修改。
        """,
        status="TODO",
        assignee="starbow",
        assignee_name="Starbow"
    )
```

---

## 完整示例: Kanban Manager Agent

```python
#!/usr/bin/env python3
from kanban_api_simple import *

def kanban_manager_workflow():
    """看板管理器工作流"""
    report = []
    
    # ========== 处理TODO任务 ==========
    todo_cards = find_cards_by_assignee(
        assignee_name="Claw",
        status="TODO"
    )
    
    for card in todo_cards:
        card_id = card['_id']
        
        # 标记为进行中
        start_progress(card_id)
        report.append(f"开始处理: {card['title']}")
        
        # 执行任务
        try:
            execute_task(card)
            
            # 标记为完成
            complete_card(card_id)
            report.append(f"完成: {card['title']}")
            
        except Exception as e:
            # 需要用户确认
            create_report_for_starbow(
                title=f"任务异常: {card['title']}",
                content=f"执行任务时出错: {str(e)}"
            )
            report.append(f"异常，已报告: {card['title']}")
    
    # ========== 检查进行中任务 ==========
    progress_cards = find_cards_by_assignee(
        assignee_name="Claw",
        status="IN_PROGRESS"
    )
    
    for card in progress_cards:
        if check_task_complete(card):
            complete_card(card['_id'])
            report.append(f"确认完成: {card['title']}")
    
    return "\n".join(report)


def execute_task(card):
    """根据卡片内容执行任务"""
    title = card['title']
    content = card['content']
    
    # 根据任务类型执行不同操作
    if "创建" in title:
        # 执行创建操作
        pass
    elif "删除" in title:
        # 执行删除操作
        pass
    elif "更新" in title:
        # 执行更新操作
        pass
    else:
        # 默认操作
        pass


def check_task_complete(card):
    """检查任务是否完成"""
    # 实现检查逻辑
    return True


# 执行工作流
if __name__ == "__main__":
    result = kanban_manager_workflow()
    print(result)
```

---

## 状态流转图

```
TODO (待处理)
    │
    ▼ 开始处理
IN_PROGRESS (进行中)
    │
    ├──► DONE (已完成) ✓
    │
    └──► REJECTED (已拒绝) ✗
```

---

## 注意事项

1. **编码问题**: 所有文本使用UTF-8编码，确保中文正常显示
2. **错误处理**: 建议添加try-except处理网络异常
3. **ID保存**: 创建卡片后保存返回的`_id`，用于后续操作
4. **状态检查**: 更新状态前先获取最新卡片信息

---

## API端点参考

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | /api/cards | 获取所有卡片 |
| POST | /api/cards | 创建卡片 |
| PUT | /api/cards/:id | 更新卡片 |
| DELETE | /api/cards/:id | 删除卡片 |

### 状态枚举
- `TODO`: 待处理
- `IN_PROGRESS`: 进行中
- `DONE`: 已完成
- `REJECTED`: 已拒绝

### 负责人ID参考
- `8kmpkr5`: Claw
- `starbow`: Starbow
