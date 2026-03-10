describe('User Assignment Feature', () => {
  beforeEach(() => {
    // 访问看板应用
    cy.visit('http://localhost:5175/');
    // 等待应用加载完成
    cy.wait(3000);
  });

  it('should assign user when creating a card', () => {
    // 等待应用完全加载
    cy.wait(5000);
    // 点击添加卡片按钮
    cy.contains('Add Card').click();
    // 填写卡片信息
    cy.get('input[placeholder="Card title"]').type('带用户分配的测试卡片');
    cy.get('textarea[placeholder="Card content"]').type('这是一个带用户分配的测试卡片');
    // 选择状态
    cy.get('select').first().select('待处理');
    // 选择用户（张三）
    cy.get('select').last().select('1'); // 1 是张三的ID
    // 提交表单
    cy.get('button[type="submit"]').click();
    // 等待卡片添加完成
    cy.wait(2000);
    // 验证卡片已添加
    cy.contains('带用户分配的测试卡片');
    // 验证用户分配状态
    cy.contains('带用户分配的测试卡片').parent().parent().contains('分配给：张三');
  });

  it('should update user assignment when editing a card', () => {
    // 等待应用完全加载
    cy.wait(5000);
    // 先添加一个卡片
    cy.contains('Add Card').click();
    cy.get('input[placeholder="Card title"]').type('编辑用户分配测试卡片');
    cy.get('textarea[placeholder="Card content"]').type('这个卡片将被编辑用户分配');
    cy.get('button[type="submit"]').click();
    // 等待卡片添加完成
    cy.wait(2000);
    
    // 点击卡片进入编辑模式
    cy.contains('编辑用户分配测试卡片').click();
    // 等待编辑模式加载
    cy.wait(1000);
    // 选择用户（李四）
    cy.get('select.assignee-select').select('2'); // 2 是李四的ID
    // 保存编辑
    cy.get('button.save-button').click();
    // 等待更新完成
    cy.wait(2000);
    // 验证用户分配已更新
    cy.contains('编辑用户分配测试卡片').parent().parent().contains('分配给：李四');
  });

  it('should show "未分配" when no user is assigned', () => {
    // 等待应用完全加载
    cy.wait(5000);
    // 先添加一个卡片（不分配用户）
    cy.contains('Add Card').click();
    cy.get('input[placeholder="Card title"]').type('未分配用户测试卡片');
    cy.get('textarea[placeholder="Card content"]').type('这个卡片没有分配用户');
    // 确保用户选择为默认值（未分配）
    cy.get('select').last().select('');
    cy.get('button[type="submit"]').click();
    // 等待卡片添加完成
    cy.wait(2000);
    // 验证卡片已添加
    cy.contains('未分配用户测试卡片');
    // 验证用户分配状态为未分配
    cy.contains('未分配用户测试卡片').parent().parent().contains('分配给：未分配');
  });

  it('should allow changing from assigned user to unassigned', () => {
    // 等待应用完全加载
    cy.wait(5000);
    // 先添加一个带用户分配的卡片
    cy.contains('Add Card').click();
    cy.get('input[placeholder="Card title"]').type('从分配到未分配测试卡片');
    cy.get('textarea[placeholder="Card content"]').type('这个卡片将从分配用户变为未分配');
    cy.get('select').last().select('3'); // 3 是王五的ID
    cy.get('button[type="submit"]').click();
    // 等待卡片添加完成
    cy.wait(2000);
    
    // 点击卡片进入编辑模式
    cy.contains('从分配到未分配测试卡片').click();
    // 等待编辑模式加载
    cy.wait(1000);
    // 选择未分配
    cy.get('select.assignee-select').select('');
    // 保存编辑
    cy.get('button.save-button').click();
    // 等待更新完成
    cy.wait(2000);
    // 验证用户分配已更新为未分配
    cy.contains('从分配到未分配测试卡片').parent().parent().contains('分配给：未分配');
  });

  it('should display user assignment correctly in different status columns', () => {
    // 等待应用完全加载
    cy.wait(5000);
    // 添加不同状态的卡片并分配用户
    
    // 添加待处理状态的卡片，分配给张三
    cy.contains('Add Card').click();
    cy.get('input[placeholder="Card title"]').type('待处理-张三');
    cy.get('textarea[placeholder="Card content"]').type('待处理状态，分配给张三');
    cy.get('select').first().select('TODO');
    cy.get('select').last().select('1');
    cy.get('button[type="submit"]').click();
    cy.wait(2000);
    
    // 添加进行中状态的卡片，分配给李四
    cy.contains('Add Card').click();
    cy.get('input[placeholder="Card title"]').type('进行中-李四');
    cy.get('textarea[placeholder="Card content"]').type('进行中状态，分配给李四');
    cy.get('select').first().select('IN_PROGRESS');
    cy.get('select').last().select('2');
    cy.get('button[type="submit"]').click();
    cy.wait(2000);
    
    // 验证不同状态列中的用户分配显示
    cy.contains('待处理').parent().parent().contains('分配给：张三');
    cy.contains('进行中').parent().parent().contains('分配给：李四');
  });
});
