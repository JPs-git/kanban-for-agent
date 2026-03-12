#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
看板(Kanban) API 调用脚本库
供智能体学习使用

API基础路径: http://localhost:8082/api
"""

import urllib.request
import ssl
import json
from typing import List, Dict, Optional, Any

# 禁用SSL验证（用于开发环境）
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

# API配置
BASE_URL = "http://localhost:8082/api"
CARDS_URL = f"{BASE_URL}/cards"


class KanbanAPI:
    """看板API客户端类"""
    
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.cards_url = f"{base_url}/cards"
    
    def _request(
        self,
        method: str,
        url: str,
        data: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        发送HTTP请求
        
        Args:
            method: HTTP方法 (GET, POST, PUT, DELETE)
            url: 请求URL
            data: 请求体数据 (可选)
        
        Returns:
            解析后的JSON响应
        """
        headers = {
            'User-Agent': 'Mozilla/5.0',
            'Content-Type': 'application/json; charset=utf-8'
        }
        
        # 如果有数据，转换为JSON并编码为UTF-8
        if data is not None:
            json_data = json.dumps(data, ensure_ascii=False).encode('utf-8')
        else:
            json_data = None
        
        # 创建请求
        req = urllib.request.Request(
            url,
            data=json_data,
            headers=headers,
            method=method
        )
        
        # 发送请求并获取响应
        with urllib.request.urlopen(
            req,
            context=ssl_context,
            timeout=10
        ) as response:
            result = json.loads(
                response.read().decode('utf-8', errors='ignore')
            )
            return result
    
    # ==================== 卡片查询操作 ====================
    
    def get_all_cards(self) -> List[Dict[str, Any]]:
        """
        获取所有卡片
        
        Returns:
            卡片列表
        """
        return self._request('GET', self.cards_url)
    
    def get_card_by_id(self, card_id: str) -> Dict[str, Any]:
        """
        根据ID获取单个卡片
        
        Args:
            card_id: 卡片ID
        
        Returns:
            卡片详情
        """
        url = f"{self.cards_url}/{card_id}"
        return self._request('GET', url)
    
    def get_cards_by_assignee(
        self,
        assignee: str,
        status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        根据负责人获取卡片
        
        Args:
            assignee: 负责人ID或名称
            status: 可选的状态过滤 (TODO, IN_PROGRESS, DONE, REJECTED)
        
        Returns:
            符合条件的卡片列表
        """
        all_cards = self.get_all_cards()
        filtered_cards = []
        
        for card in all_cards:
            card_assignee = card.get('assignee', '')
            card_assignee_name = card.get('assigneeName', '')
            
            # 匹配负责人ID或名称
            if assignee in [card_assignee, card_assignee_name]:
                if status is None or card.get('status') == status:
                    filtered_cards.append(card)
        
        return filtered_cards
    
    def get_cards_by_status(self, status: str) -> List[Dict[str, Any]]:
        """
        根据状态获取卡片
        
        Args:
            status: 状态 (TODO, IN_PROGRESS, DONE, REJECTED)
        
        Returns:
            符合条件的卡片列表
        """
        all_cards = self.get_all_cards()
        return [c for c in all_cards if c.get('status') == status]
    
    # ==================== 卡片创建操作 ====================
    
    def create_card(
        self,
        title: str,
        content: str = "",
        status: str = "TODO",
        assignee: str = "",
        assignee_name: str = ""
    ) -> Dict[str, Any]:
        """
        创建新卡片
        
        Args:
            title: 卡片标题 (必填)
            content: 卡片内容 (可选)
            status: 状态 (可选, 默认TODO)
            assignee: 负责人ID (可选)
            assignee_name: 负责人姓名 (可选)
        
        Returns:
            创建的卡片详情
        """
        data = {
            "title": title,
            "content": content,
            "status": status,
            "assignee": assignee,
            "assigneeName": assignee_name
        }
        return self._request('POST', self.cards_url, data)
    
    # ==================== 卡片更新操作 ====================
    
    def update_card(
        self,
        card_id: str,
        title: Optional[str] = None,
        content: Optional[str] = None,
        status: Optional[str] = None,
        assignee: Optional[str] = None,
        assignee_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        更新卡片信息
        
        Args:
            card_id: 卡片ID
            title: 新标题 (可选)
            content: 新内容 (可选)
            status: 新状态 (可选)
            assignee: 新负责人ID (可选)
            assignee_name: 新负责人姓名 (可选)
        
        Returns:
            更新后的卡片详情
        """
        url = f"{self.cards_url}/{card_id}"
        
        # 只包含要更新的字段
        data = {}
        if title is not None:
            data["title"] = title
        if content is not None:
            data["content"] = content
        if status is not None:
            data["status"] = status
        if assignee is not None:
            data["assignee"] = assignee
        if assignee_name is not None:
            data["assigneeName"] = assignee_name
        
        return self._request('PUT', url, data)
    
    def update_card_status(
        self,
        card_id: str,
        status: str
    ) -> Dict[str, Any]:
        """
        更新卡片状态（快捷方法）
        
        Args:
            card_id: 卡片ID
            status: 新状态 (TODO, IN_PROGRESS, DONE, REJECTED)
        
        Returns:
            更新后的卡片详情
        """
        return self.update_card(card_id, status=status)
    
    def assign_card(
        self,
        card_id: str,
        assignee: str,
        assignee_name: str
    ) -> Dict[str, Any]:
        """
        分配卡片给指定负责人（快捷方法）
        
        Args:
            card_id: 卡片ID
            assignee: 负责人ID
            assignee_name: 负责人姓名
        
        Returns:
            更新后的卡片详情
        """
        return self.update_card(
            card_id,
            assignee=assignee,
            assignee_name=assignee_name
        )
    
    # ==================== 卡片删除操作 ====================
    
    def delete_card(self, card_id: str) -> Dict[str, Any]:
        """
        删除卡片
        
        Args:
            card_id: 卡片ID
        
        Returns:
            删除结果消息
        """
        url = f"{self.cards_url}/{card_id}"
        return self._request('DELETE', url)
    
    # ==================== 统计和报告 ====================
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        获取看板统计信息
        
        Returns:
            统计数据字典
        """
        all_cards = self.get_all_cards()
        
        stats = {
            "total": len(all_cards),
            "by_status": {
                "TODO": 0,
                "IN_PROGRESS": 0,
                "DONE": 0,
                "REJECTED": 0
            },
            "by_assignee": {}
        }
        
        for card in all_cards:
            # 按状态统计
            status = card.get('status', 'TODO')
            if status in stats["by_status"]:
                stats["by_status"][status] += 1
            
            # 按负责人统计
            assignee = card.get('assigneeName', '未分配')
            if assignee not in stats["by_assignee"]:
                stats["by_assignee"][assignee] = 0
            stats["by_assignee"][assignee] += 1
        
        return stats
    
    def print_report(self):
        """打印看板报告"""
        stats = self.get_statistics()
        
        print("=" * 60)
        print("看板统计报告")
        print("=" * 60)
        print(f"\n总卡片数: {stats['total']}")
        
        print("\n按状态分布:")
        for status, count in stats["by_status"].items():
            print(f"  {status}: {count}")
        
        print("\n按负责人分布:")
        for assignee, count in stats["by_assignee"].items():
            print(f"  {assignee}: {count}")
        
        print("=" * 60)


# ==================== 使用示例 ====================

if __name__ == "__main__":
    # 创建API客户端实例
    kanban = KanbanAPI()
    
    # 示例1: 获取所有卡片
    print("示例1: 获取所有卡片")
    cards = kanban.get_all_cards()
    print(f"共有 {len(cards)} 张卡片\n")
    
    # 示例2: 获取分配给Claw的TODO卡片
    print("示例2: 获取Claw的TODO任务")
    claw_todo = kanban.get_cards_by_assignee("Claw", status="TODO")
    print(f"Claw有 {len(claw_todo)} 个TODO任务\n")
    
    # 示例3: 创建新卡片
    print("示例3: 创建新卡片")
    # new_card = kanban.create_card(
    #     title="新任务",
    #     content="这是任务描述",
    #     status="TODO",
    #     assignee="starbow",
    #     assignee_name="Starbow"
    # )
    # print(f"创建成功: {new_card['_id']}\n")
    
    # 示例4: 更新卡片状态
    print("示例4: 更新卡片状态")
    # updated = kanban.update_card_status(
    #     card_id="xxx",
    #     status="IN_PROGRESS"
    # )
    # print(f"状态更新为: {updated['status']}\n")
    
    # 示例5: 打印统计报告
    print("示例5: 打印统计报告")
    kanban.print_report()
