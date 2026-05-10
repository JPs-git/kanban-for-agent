import { render, screen, fireEvent } from '@testing-library/react';
import CardEditModal from './CardEditModal';
import { CardStatus } from '../types';
import { vi } from 'vitest';

const mockUsers = [
  { _id: '1', name: 'User 1' },
  { _id: '2', name: 'User 2' },
];

const mockCard = {
  _id: '1',
  title: 'Test Card',
  content: 'Test Content',
  status: CardStatus.IN_PROGRESS,
  assignee: '1',
  assigneeName: 'User 1',
};

describe('CardEditModal', () => {
  test('should auto-fill form with card data when modal opens', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <CardEditModal
        card={mockCard}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        users={mockUsers}
      />
    );

    // 验证输入框已自动填充
    const titleInput = screen.getByPlaceholderText('Card title');
    const contentInput = screen.getByPlaceholderText('Card content');
    const statusSelect = screen.getByLabelText('状态');
    const assigneeSelect = screen.getByLabelText('分配给');

    expect(titleInput).toHaveValue('Test Card');
    expect(contentInput).toHaveValue('Test Content');
    expect(statusSelect).toHaveValue(CardStatus.IN_PROGRESS);
    expect(assigneeSelect).toHaveValue('1');
  });

  test('should update form when card prop changes', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    const { rerender } = render(
      <CardEditModal
        card={mockCard}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        users={mockUsers}
      />
    );

    // 验证初始值
    expect(screen.getByPlaceholderText('Card title')).toHaveValue('Test Card');

    // 更改卡片数据
    const updatedCard = {
      ...mockCard,
      title: 'Updated Card',
      content: 'Updated Content',
      status: CardStatus.DONE,
      assignee: '2',
    };

    rerender(
      <CardEditModal
        card={updatedCard}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        users={mockUsers}
      />
    );

    // 验证表单已更新
    expect(screen.getByPlaceholderText('Card title')).toHaveValue('Updated Card');
    expect(screen.getByPlaceholderText('Card content')).toHaveValue('Updated Content');
    expect(screen.getByLabelText('状态')).toHaveValue(CardStatus.DONE);
    expect(screen.getByLabelText('分配给')).toHaveValue('2');
  });

  test('should call onSave with correct data when form is submitted', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <CardEditModal
        card={mockCard}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        users={mockUsers}
      />
    );

    // 修改表单
    fireEvent.change(screen.getByPlaceholderText('Card title'), {
      target: { value: 'Updated Title' },
    });

    // 提交表单
    fireEvent.click(screen.getByText('保存'));

    // 验证 onSave 被调用
    expect(onSave).toHaveBeenCalledWith('1', {
      title: 'Updated Title',
      content: 'Test Content',
      status: CardStatus.IN_PROGRESS,
      assignee: '1',
      assigneeName: 'User 1',
    });

    // 验证 onClose 被调用
    expect(onClose).toHaveBeenCalled();
  });

  test('should not call onSave when title is empty', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <CardEditModal
        card={mockCard}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        users={mockUsers}
      />
    );

    // 清空标题
    fireEvent.change(screen.getByPlaceholderText('Card title'), {
      target: { value: '' },
    });

    // 提交表单
    fireEvent.click(screen.getByText('保存'));

    // 验证 onSave 未被调用
    expect(onSave).not.toHaveBeenCalled();
  });

  test('should return null when isOpen is false', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    const { container } = render(
      <CardEditModal
        card={mockCard}
        isOpen={false}
        onClose={onClose}
        onSave={onSave}
        users={mockUsers}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('should return null when card is null', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    const { container } = render(
      <CardEditModal
        card={null}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        users={mockUsers}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});