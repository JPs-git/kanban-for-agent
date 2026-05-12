import { render, screen, fireEvent } from '@testing-library/react';
import AddCardModal from './AddCardModal';
import { CardStatus } from '../types';
import { vi } from 'vitest';

const mockUsers = [
  { id: '1', name: 'User 1' },
  { id: '2', name: 'User 2' },
];

describe('AddCardModal', () => {
  test('should reset form state when modal opens', async () => {
    const onAdd = vi.fn();
    const onClose = vi.fn();

    const { rerender } = render(
      <AddCardModal
        isOpen={false}
        onClose={onClose}
        onAdd={onAdd}
        users={mockUsers}
      />
    );

    rerender(
      <AddCardModal
        isOpen={true}
        onClose={onClose}
        onAdd={onAdd}
        users={mockUsers}
      />
    );

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

    fireEvent.click(screen.getByText('保存'));

    expect(onAdd).toHaveBeenCalledWith({
      title: 'Test Card',
      content: 'Test Content',
      status: CardStatus.IN_PROGRESS,
      assignee: '1',
      assigneeName: 'User 1',
    });

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

    fireEvent.click(screen.getByText('保存'));

    expect(onAdd).not.toHaveBeenCalled();
  });
});
