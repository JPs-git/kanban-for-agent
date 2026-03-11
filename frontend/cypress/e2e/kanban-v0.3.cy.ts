describe('Kanban Board v0.3 Tests', () => {
  beforeEach(() => {
    // 访问看板应用
    cy.visit('http://localhost:5176/');
    // 等待应用加载完成
    cy.wait(3000);
  });

  it('should center the kanban board on PC', () => {
    // 检查看板是否存在且可见
    cy.get('.kanban-board').should('be.visible');
    // 检查看板的CSS样式是否设置了最大宽度
    cy.get('.kanban-board').should('have.css', 'max-width');
  });

  it('should have enough space for 4 columns', () => {
    // 检查是否有4个状态列
    cy.get('.status-column').should('have.length', 4);
    // 检查每个列的最小宽度（实际值是280px）
    cy.get('.status-column').each(($column) => {
      cy.wrap($column).should('have.css', 'min-width', '280px');
    });
    // 检查看板内容区域是否使用flex布局
    cy.get('.board-content').should('have.css', 'display', 'flex');
  });

  it('should allow user management (add, edit, delete users)', () => {
    // 打开用户管理面板
    cy.contains('用户管理').click();
    cy.wait(1000);

    // 检查用户管理面板是否打开
    cy.get('.user-management-panel').should('exist');

    // 添加新用户
    cy.contains('添加用户').click();
    cy.wait(500);
    cy.get('.user-form input').type('测试用户');
    cy.get('.save-button').click();
    cy.wait(500);
    // 验证用户已添加
    cy.contains('测试用户');

    // 编辑用户
    cy.contains('测试用户').parent().parent().find('.edit-button').click();
    cy.wait(500);
    cy.get('.user-form input').clear().type('编辑后的测试用户');
    cy.get('.save-button').click();
    cy.wait(500);
    // 验证用户已更新
    cy.contains('编辑后的测试用户');

    // 删除用户
    cy.contains('编辑后的测试用户').parent().parent().find('.delete-button').click();
    cy.wait(500);
    cy.get('.delete-confirm-button').click();
    cy.wait(500);
    // 验证用户已删除
    cy.contains('编辑后的测试用户').should('not.exist');

    // 关闭用户管理面板
    cy.get('.close-button').click();
    cy.wait(500);
    // 验证用户管理面板已关闭
    cy.get('.user-management-panel').should('not.exist');
  });

  it('should not show error when adding card without content and display non-blocking message', () => {
    // 点击添加卡片按钮
    cy.contains('Add Card').click();
    // 只填写标题，不填写内容
    cy.get('input[placeholder="Card title"]').type('测试卡片（空内容）');
    // 选择状态
    cy.get('select').first().select('待处理');
    // 提交表单
    cy.get('button[type="submit"]').click();
    // 等待卡片添加完成
    cy.wait(2000);
    // 检查是否有错误信息
    cy.get('.error').should('not.exist');
    // 验证卡片已添加
    cy.contains('测试卡片（空内容）');
    // 检查是否显示成功提示消息
    cy.get('.toast').should('exist');
    cy.get('.toast').contains('卡片添加成功');
  });
});
