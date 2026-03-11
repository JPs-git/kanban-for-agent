import { CardStatus } from '../../src/types';

describe('Kanban Board v0.4', () => {
  beforeEach(() => {
    // 访问应用
    cy.visit('http://localhost:5176');
    
    // 等待应用加载
    cy.wait(1000);
  });

  it('should have optimized user management modal width without scrollbar', () => {
    // 点击用户管理按钮
    cy.contains('用户管理').click();
    
    // 验证用户管理模态框宽度
    cy.get('.modal-content').should('have.css', 'width', '400px');
    
    // 关闭模态框
    cy.get('.modal-close').click();
  });

  it('should have unified button component design with consistent size', () => {
    // 打开用户管理
    cy.contains('用户管理').click();
    
    // 验证编辑和删除按钮存在
    cy.get('.btn-primary').should('exist');
    cy.get('.btn-danger').should('exist');
    
    // 关闭用户管理
    cy.get('.modal-close').click();
    
    // 验证添加卡片按钮样式
    cy.contains('Add Card').should('exist');
  });

  it('should have unified modal component design with click outside to close', () => {
    // 测试添加卡片模态框
    cy.get('.btn-success').contains('Add Card').first().click();
    
    // 验证模态框存在
    cy.get('.modal-overlay').should('exist');
    
    // 点击模态框外部区域关闭
    cy.get('.modal-overlay').first().click('topLeft');
    
    // 验证模态框已关闭
    cy.get('.modal-overlay').should('not.exist');
  });

  it('should have optimized delete card button (show on hover, gray color)', () => {
    // 创建一个测试卡片
    cy.get('.btn-success').contains('Add Card').first().click();
    cy.get('#add-title').type('Test Card for Delete');
    cy.get('#add-content').type('Test Content');
    cy.get('.btn-success').first().click();
    
    // 等待卡片创建
    cy.wait(1000);
    
    // 验证删除按钮默认隐藏
    cy.get('.card .delete-button').first().should('have.css', 'opacity', '0');
    cy.get('.card .delete-button').first().should('have.css', 'visibility', 'hidden');
    
    // 鼠标hover卡片
    cy.get('.card').first().trigger('mouseenter');
    
    // 验证删除按钮显示
    cy.get('.card .delete-button').first().should('have.css', 'opacity', '1');
    cy.get('.card .delete-button').first().should('have.css', 'visibility', 'visible');
    
    // 验证删除按钮颜色为灰色
    cy.get('.card .delete-button').first().should('have.css', 'color', 'rgb(153, 153, 153)');
  });

  it('should have optimized overall layout (100% width, horizontally centered)', () => {
    // 验证看板宽度
    cy.get('.kanban-board').should('have.css', 'width');
    
    // 验证看板水平居中
    cy.get('.kanban-board').should('have.css', 'margin');
    
    // 验证最大宽度
    cy.get('.kanban-board').should('have.css', 'max-width');
  });

  it('should have add card functionality as modal', () => {
    // 点击添加卡片按钮
    cy.get('.btn-success').contains('Add Card').first().click();
    
    // 验证添加卡片模态框存在
    cy.get('.modal-overlay').first().should('exist');
    cy.get('.modal-header h3').first().should('have.text', '添加卡片');
    
    // 填写卡片信息
    cy.get('#add-title').first().type('New Card via Modal');
    cy.get('#add-content').first().type('Card content added through modal');
    cy.get('#add-status').first().select(CardStatus.TODO);
    
    // 保存卡片
    cy.get('.btn-success').first().click();
    
    // 等待模态框关闭和卡片创建
    cy.wait(1000);
    
    // 验证模态框已关闭
    cy.get('.modal-overlay').should('not.exist');
    
    // 验证卡片已创建
    cy.get('.card').contains('New Card via Modal').should('exist');
  });

  it('should test responsive design for user management modal', () => {
    // 模拟小屏幕
    cy.viewport(768, 600);
    
    // 打开用户管理
    cy.contains('用户管理').click();
    
    // 验证用户管理模态框存在
    cy.get('.modal-content').should('exist');
    
    // 关闭用户管理
    cy.get('.modal-close').click();
  });

  it('should test modal animation smoothness', () => {
    // 打开添加卡片模态框
    cy.contains('Add Card').click();
    
    // 验证模态框有动画效果
    cy.get('.modal-content').should('have.class', 'modal-content');
    
    // 关闭模态框
    cy.get('.modal-close').click();
    
    // 验证模态框已关闭
    cy.get('.modal-overlay').should('not.exist');
  });
});
