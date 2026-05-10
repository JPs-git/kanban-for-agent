import { render, screen, fireEvent } from '@testing-library/react';
import AddCardModal from './AddCardModal';
import { CardStatus } from '../types';
import { vi } from 'vitest';

const mockUsers = [
  { _id: '1', name: 'User 1' },
  { _id: '2', name: 'User 2' },
];

describe('AddCardModal', () => {
  test('should reset form state when modal opens', async () => {
    const onAdd = vi.fn();
    const onClose = vi.fn();

    // 第一次渲染，模态框关闭
    const { rerender } = render(
      <AddCardModal
        isOpen={false}
        onClose={onClose}
        onAdd={onAdd}
        users={mockUsers}
      />
    );

    // 打开模态框
    rerender(
      <AddCardModal
        isOpen={true}
        onClose={onClose}
        onAdd={onAdd}
        users={mockUsers}
      />
    );

    // 验证输入框为空
    const titleInput = screen.getByPlaceholderText('Card title');
    const contentInput = screen.getByPlaceholderText('Card content');
    const statusSelect = screen.getByLabelText('状态');
    const assigneeSelect = screen.getByLabelText('分配给');

    expect(titleInput).toHaveValue('');
    expect(contentInput).toHaveValue('');
    expect(statusSelect).toHaveValue(CardStatus.TODO);
    expect(assigneeSelect).toHaveValue('');
  });

  test('should call onAdd with correct data when form is submitted', () => {
    const onAdd = vi.fn();
    const onClose = vi.fn();

    render(
      <AddCardModal
        isOpen={true}
        onClose={onClose}
        onAdd={onAdd}
        users={mockUsers}
      />
    );

    // 填写表单
    fireEvent.change(screen.getByPlaceholderText('Card title'), {
      target: { value: 'Test Card' },
    });

    fireEvent.change(screen.getByPlaceholderText('Card content'), {
      target: { value: 'Test Content' },
    });

    fireEvent.change(screen.getByLabelText('状态'), {
      target: { value: CardStatus.IN_PROGRESS },
    });

    fireEvent.change(screen.getByLabelText('分配给'), {
      target: { value: '1' },
    });

    // 提交表单
    fireEvent.click(screen.getByText('保存'));

    // 验证 onAdd 被调用
    expect(onAdd).toHaveBeenCalledWith({
      title: 'Test Card',
      content: 'Test Content',
      status: CardStatus.IN_PROGRESS,
      assignee: '1',
      assigneeName: 'User 1',
    });

    // 验证 onClose 被调用
    expect(onClose).toHaveBeenCalled();
  });

  test('should not call onAdd when title is empty', () => {
    const onAdd = vi.fn();
    const onClose = vi.fn();

    render(
      <AddCardModal
        isOpen={true}
        onClose={onClose}
        onAdd={onAdd}
        users={mockUsers}
      />
    );

    // 提交表单（标题为空）
    fireEvent.click(screen.getByText('保存'));

    // 验证 onAdd 未被调用
    expect(onAdd).not.toHaveBeenCalled();
  });
});