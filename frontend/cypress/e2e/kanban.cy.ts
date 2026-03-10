describe('Kanban Board', () => {
  beforeEach(() => {
    // 访问看板应用
    cy.visit('/');
    // 等待一段时间，确保应用加载完成
    cy.wait(3000);
    // 截图，查看页面状态
    cy.screenshot('before-test');
    // 打印页面文本内容，查看实际显示的内容
    cy.get('body').invoke('text').then((text) => {
      console.log('Page Text:', text);
    });
    // 打印页面上的所有元素
    cy.get('*').then((elements) => {
      console.log('All elements:', elements.length);
      elements.each((index, element) => {
        console.log(index, element.tagName, element.className);
      });
    });
  });

  it('should load the kanban board successfully', () => {
    // 验证页面标题
    cy.title().should('contain', 'frontend');
    // 等待应用完全加载
    cy.wait(5000);
    // 验证看板标题（使用contains而不是get）
    cy.contains('Kanban Board');
    // 验证状态列
    cy.contains('待处理');
    cy.contains('进行中');
    cy.contains('已完成');
    cy.contains('已拒绝');
  });

  it('should add a new card', () => {
    // 等待应用完全加载
    cy.wait(5000);
    // 点击添加卡片按钮（使用contains而不是get）
    cy.contains('Add Card').click();
    // 填写卡片信息
    cy.get('input[placeholder="Card title"]').type('测试卡片');
    cy.get('textarea[placeholder="Card content"]').type('这是一个测试卡片');
    // 选择状态
    cy.get('select').select('待处理');
    // 提交表单
    cy.get('button[type="submit"]').click();
    // 等待卡片添加完成
    cy.wait(2000);
    // 验证卡片已添加
    cy.contains('测试卡片');
  });

  it('should delete a card', () => {
    // 等待应用完全加载
    cy.wait(5000);
    // 先添加一个卡片
    cy.contains('Add Card').click();
    cy.get('input[placeholder="Card title"]').type('删除测试卡片');
    cy.get('textarea[placeholder="Card content"]').type('这个卡片将被删除');
    cy.get('button[type="submit"]').click();
    // 等待卡片添加完成
    cy.wait(2000);
    
    // 找到刚添加的卡片并删除
    cy.contains('删除测试卡片').parent().parent().find('button').contains('×').click();
    // 等待卡片删除完成
    cy.wait(2000);
    
    // 验证卡片已删除
    cy.contains('删除测试卡片').should('not.exist');
  });

  it('should check for console errors', () => {
    // 监听控制台错误
    cy.window().then((win) => {
      cy.spy(win.console, 'error').as('consoleError');
    });
    
    // 等待一段时间，确保所有操作都已完成
    cy.wait(1000);
    
    // 验证没有控制台错误
    cy.get('@consoleError').should('not.be.called');
  });
});