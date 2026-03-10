describe('Kanban Board v0.2 Fixes', () => {
  beforeEach(() => {
    // 访问看板应用
    cy.visit('/');
    // 等待应用加载完成
    cy.wait(3000);
  });

  it('should allow creating a card with empty content', () => {
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
  });

  it('should have white background for input fields', () => {
    // 点击添加卡片按钮
    cy.contains('Add Card').click();
    // 检查输入框背景色
    cy.get('input[placeholder="Card title"]').should('have.css', 'background-color', 'rgb(255, 255, 255)');
    // 检查文本域背景色
    cy.get('textarea[placeholder="Card content"]').should('have.css', 'background-color', 'rgb(255, 255, 255)');
  });

  it('should show user names in assignment dropdown', () => {
    // 点击添加卡片按钮
    cy.contains('Add Card').click();
    // 检查人员分配下拉框
    cy.get('select').eq(1).find('option').should('have.length.greaterThan', 0);
    // 检查下拉框背景色
    cy.get('select').eq(1).should('have.css', 'background-color', 'rgb(255, 255, 255)');
  });

  it('should allow manual status change when editing a card', () => {
    // 先添加一个测试卡片
    cy.contains('Add Card').click();
    cy.get('input[placeholder="Card title"]').type('测试状态修改');
    cy.get('select').first().select('待处理');
    cy.get('button[type="submit"]').click();
    cy.wait(2000);

    // 点击卡片进入编辑模式
    cy.contains('测试状态修改').click();
    cy.wait(1000);

    // 检查编辑模态框是否存在
    cy.get('.modal-content').should('exist');
    
    // 更改状态
    cy.get('.modal-content select').first().select('进行中');
    
    // 保存更改
    cy.get('.modal-content button').contains('Save').click();
    cy.wait(2000);

    // 验证状态已更新
    // 注意：这里需要根据实际的状态显示方式进行调整
    // 假设状态会显示在卡片上
    cy.contains('测试状态修改').parent().parent().should('contain', '进行中');
  });

  it('should only allow one card to be edited at a time (modal implementation)', () => {
    // 先添加两个测试卡片
    cy.contains('Add Card').click();
    cy.get('input[placeholder="Card title"]').type('测试卡片1');
    cy.get('select').first().select('待处理');
    cy.get('button[type="submit"]').click();
    cy.wait(2000);

    cy.contains('Add Card').click();
    cy.get('input[placeholder="Card title"]').type('测试卡片2');
    cy.get('select').first().select('待处理');
    cy.get('button[type="submit"]').click();
    cy.wait(2000);

    // 点击第一个卡片进入编辑模式
    cy.contains('测试卡片1').click();
    cy.wait(1000);

    // 检查编辑模态框是否存在
    cy.get('.modal-content').should('exist');

    // 尝试点击第二个卡片
    cy.contains('测试卡片2').click();
    cy.wait(1000);

    // 验证仍然只有一个模态框
    cy.get('.modal-content').should('have.length', 1);

    // 关闭模态框
    cy.get('.modal-content button').contains('Cancel').click();
    cy.wait(1000);

    // 验证模态框已关闭
    cy.get('.modal-content').should('not.exist');
  });
});