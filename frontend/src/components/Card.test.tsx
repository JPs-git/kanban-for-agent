import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Card from './Card';
import { CardStatus } from '../types';

// 模拟react-dnd
vi.mock('react-dnd', () => ({
  useDrag: vi.fn(() => [
    { isDragging: false },
    vi.fn(),
  ]),
}));

describe('Card Component', () => {
  const mockCard = {
    _id: '1',
    title: 'Test Card',
    content: 'Test content',
    status: CardStatus.TODO,
    assigneeName: 'John Doe',
  };

  const mockOnDelete = vi.fn();
  const mockOnEdit = vi.fn();

  test('renders card with title and content', () => {
    render(<Card card={mockCard} onDelete={mockOnDelete} onEdit={mockOnEdit} />);
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('renders assignee name when provided', () => {
    render(<Card card={mockCard} onDelete={mockOnDelete} onEdit={mockOnEdit} />);
    expect(screen.getByText('分配给：')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('renders "未分配" when assigneeName is not provided', () => {
    const cardWithoutAssignee = { ...mockCard, assigneeName: undefined };
    render(<Card card={cardWithoutAssignee} onDelete={mockOnDelete} onEdit={mockOnEdit} />);
    expect(screen.getByText('未分配')).toBeInTheDocument();
  });

  test('renders correct status label', () => {
    render(<Card card={mockCard} onDelete={mockOnDelete} onEdit={mockOnEdit} />);
    expect(screen.getByText('待处理')).toBeInTheDocument();
  });

  test('calls onEdit when card is clicked', () => {
    render(<Card card={mockCard} onDelete={mockOnDelete} onEdit={mockOnEdit} />);
    const cardElement = screen.getByText('Test Card').closest('.card');
    fireEvent.click(cardElement!);
    expect(mockOnEdit).toHaveBeenCalledWith(mockCard);
  });

  test('calls onDelete when delete button is clicked', () => {
    render(<Card card={mockCard} onDelete={mockOnDelete} onEdit={mockOnEdit} />);
    const deleteButton = screen.getByLabelText('Delete card');
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  test('renders card with correct base styles', () => {
    const { container } = render(<Card card={mockCard} onDelete={mockOnDelete} onEdit={mockOnEdit} />);
    const cardElement = container.querySelector('.card');
    expect(cardElement).toHaveStyle('cursor: pointer');
  });
});
