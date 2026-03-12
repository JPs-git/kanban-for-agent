#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
看板反馈收集与同步脚本
功能：
1. 收集分配给Trae的任务
2. 生成用户反馈文档
3. 更新卡片状态为DONE
4. 创建验收卡片分配给Starbow
"""

import os
import json
from datetime import datetime
from kanban_api_client import KanbanAPI

# 文档保存目录
DOCUMENTS_DIR = r"c:\Users\Administrator\Projects\kanban-for-agent\.trae\documents"

class KanbanFeedbackManager:
    """看板反馈管理类"""
    
    def __init__(self):
        self.kanban = KanbanAPI()
        self.trae_cards = []
        self.today = datetime.now().strftime("%Y-%m-%d")
    
    def collect_trae_tasks(self):
        """收集分配给Trae的任务"""
        print("=== 开始收集Trae的任务 ===")
        self.trae_cards = self.kanban.get_cards_by_assignee("Trae")
        print(f"发现 {len(self.trae_cards)} 个分配给Trae的任务")
        
        for card in self.trae_cards:
            print(f"- {card['title']} (状态: {card['status']})")
        
        return self.trae_cards
    
    def generate_feedback_document(self):
        """生成用户反馈文档"""
        print("\n=== 生成用户反馈文档 ===")
        
        if not self.trae_cards:
            print("没有发现Trae的任务，跳过文档生成")
            return None
        
        # 生成文档内容
        content = f"# Trae 任务反馈报告\n\n"
        content += f"## 概览\n\n"
        content += f"**生成时间**: {self.today}\n"
        content += f"**任务总数**: {len(self.trae_cards)}\n"
        content += "**任务类型**: "
        
        # 分析任务类型
        bug_count = sum(1 for card in self.trae_cards if "BUG" in card['title'])
        feature_count = sum(1 for card in self.trae_cards if "功能" in card['title'] or "Feature" in card['title'])
        other_count = len(self.trae_cards) - bug_count - feature_count
        
        task_types = []
        if bug_count > 0:
            task_types.append(f"BUG修复 ({bug_count})")
        if feature_count > 0:
            task_types.append(f"功能开发 ({feature_count})")
        if other_count > 0:
            task_types.append(f"其他任务 ({other_count})")
        
        content += ", ".join(task_types) + "\n"
        
        # 状态分布
        status_counts = {}
        for card in self.trae_cards:
            status = card['status']
            status_counts[status] = status_counts.get(status, 0) + 1
        
        content += "**状态分布**: "
        status_str = ", ".join([f"{k}: {v}" for k, v in status_counts.items()])
        content += status_str + "\n\n"
        
        # 详细任务列表
        content += "## 详细任务列表\n\n"
        content += "| 任务ID | 标题 | 状态 | 内容 |\n"
        content += "|--------|------|------|------|\n"
        
        for card in self.trae_cards:
            content += f"| {card['_id']} | {card['title']} | {card['status']} | {card.get('content', '无')} |\n"
        
        # 问题分析
        content += "\n## 问题分析\n\n"
        content += "### 问题类型分析\n"
        if bug_count > 0:
            content += f"- **BUG修复**: {bug_count}个任务，主要涉及功能缺陷和用户体验问题\n"
        if feature_count > 0:
            content += f"- **功能开发**: {feature_count}个任务，涉及新功能实现\n"
        if other_count > 0:
            content += f"- **其他任务**: {other_count}个任务\n"
        
        content += "\n### 优先级评估\n"
        content += "- **高优先级**: 影响核心功能的BUG需要优先处理\n"
        content += "- **中优先级**: 功能优化和改进任务\n"
        content += "- **低优先级**: 非关键的调整和维护任务\n"
        
        # 建议措施
        content += "\n## 建议措施\n\n"
        content += "### 技术建议\n"
        content += "1. **BUG修复**: 优先解决影响用户体验的关键BUG\n"
        content += "2. **功能开发**: 按计划实施新功能，确保代码质量\n"
        content += "3. **测试验证**: 修复后进行充分的测试验证\n"
        
        content += "\n### 测试建议\n"
        content += "1. **功能测试**: 验证修复的BUG是否彻底解决\n"
        content += "2. **回归测试**: 确保修复不会引入新问题\n"
        content += "3. **用户验收测试**: 验证功能是否符合用户预期\n"
        
        # 总结
        content += "\n## 总结\n"
        content += f"本次反馈涵盖了Trae负责的{len(self.trae_cards)}个任务，" 
        content += "建议按优先级有序处理，确保产品质量和用户体验。\n"
        
        # 保存文档
        filename = f"trae_feedback_{self.today}.md"
        file_path = os.path.join(DOCUMENTS_DIR, filename)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"文档生成成功: {file_path}")
        return file_path
    
    def update_card_statuses(self):
        """更新卡片状态为DONE"""
        print("\n=== 更新卡片状态 ===")
        
        for card in self.trae_cards:
            if card['status'] != "DONE":
                print(f"更新卡片状态: {card['title']} -> DONE")
                self.kanban.update_card_status(card['_id'], "DONE")
            else:
                print(f"卡片已完成: {card['title']}")
    
    def create_acceptance_cards(self):
        """为每个任务创建验收卡片"""
        print("\n=== 创建验收卡片 ===")
        
        for card in self.trae_cards:
            acceptance_title = f"[{card['title']}] 功能验收"
            acceptance_content = f"验收要点：\n"
            acceptance_content += "1. 验证功能是否正常工作\n"
            acceptance_content += "2. 检查是否符合用户需求\n"
            acceptance_content += "3. 确认无回归问题\n"
            
            print(f"创建验收卡片: {acceptance_title}")
            self.kanban.create_card(
                title=acceptance_title,
                content=acceptance_content,
                status="TODO",
                assignee_name="Starbow",
                assignee="69b2b4c04c4d5710d5528247"
            )
    
    def run_workflow(self):
        """运行完整工作流"""
        try:
            # 1. 收集Trae的任务
            self.collect_trae_tasks()
            
            if not self.trae_cards:
                print("没有发现Trae的任务，结束流程")
                return
            
            # 2. 生成反馈文档
            doc_path = self.generate_feedback_document()
            
            # 3. 更新卡片状态
            self.update_card_statuses()
            
            # 4. 创建验收卡片
            self.create_acceptance_cards()
            
            # 5. 打印完成信息
            print("\n=== 工作流执行完成 ===")
            print(f"- 处理任务数: {len(self.trae_cards)}")
            print(f"- 生成文档: {doc_path}")
            print(f"- 创建验收卡片: {len(self.trae_cards)}")
            
        except Exception as e:
            print(f"执行过程中出错: {str(e)}")

if __name__ == "__main__":
    # 运行工作流
    manager = KanbanFeedbackManager()
    manager.run_workflow()
