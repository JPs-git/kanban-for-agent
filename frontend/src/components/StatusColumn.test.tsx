
import { render, screen } from '@testing-library/react';
import StatusColumn from './StatusColumn';
import { CardStatus } from '../types';

// 模拟react-dnd
vi.mock('react-dnd', () => ({
  useDrop: vi.fn(() => [
    { isOver: false },
    vi.fn(),
  ]),
}));

// 模拟Card组件
vi.mock('./Card', () => {
  return {
    default: function MockCard({ card, onDelete, onEdit }: { card: { _id: string; title: string }; onDelete: (id: string) => void; onEdit: (card: { _id: string; title: string }) => void }) {
      return (
        <div data-testid={`card-${card._id}`}>
          <h3>{card.title}</h3>
          <button onClick={() => onDelete(card._id)}>Delete</button>
          <button onClick={() => onEdit(card)}>Edit</button>
        </div>
      );
    }
  };
});

describe('StatusColumn Component', () => {
  const mockCards = [
    {
      _id: '1',
      title: 'Card 1',
      content: 'Content 1',
      status: CardStatus.TODO,
      assigneeName: 'John Doe',
    },
    {
      _id: '2',
      title: 'Card 2',
      content: 'Content 2',
      status: CardStatus.TODO,
      assigneeName: 'Jane Smith',
    },
  ];

  const mockOnCardDrop = vi.fn();
  const mockOnDeleteCard = vi.fn();
  const mockOnEditCard = vi.fn();

  test('renders status column with correct label for TODO status', () => {
    render(
      <StatusColumn
        status={CardStatus.TODO}
        cards={mockCards}
        onCardDrop={mockOnCardDrop}
        onDeleteCard={mockOnDeleteCard}
        onEditCard={mockOnEditCard}
      />
    );
    expect(screen.getByText('待处理')).toBeInTheDocument();
  });

  test('renders status column with correct label for IN_PROGRESS status', () => {
    render(
      <StatusColumn
        status={CardStatus.IN_PROGRESS}
        cards={[]}
        onCardDrop={mockOnCardDrop}
        onDeleteCard={mockOnDeleteCard}
        onEditCard={mockOnEditCard}
      />
    );
    expect(screen.getByText('进行中')).toBeInTheDocument();
  });

  test('renders status column with correct label for DONE status', () => {
    render(
      <StatusColumn
        status={CardStatus.DONE}
        cards={[]}
        onCardDrop={mockOnCardDrop}
        onDeleteCard={mockOnDeleteCard}
        onEditCard={mockOnEditCard}
      />
    );
    expect(screen.getByText('已完成')).toBeInTheDocument();
  });

  test('renders status column with correct label for REJECTED status', () => {
    render(
      <StatusColumn
        status={CardStatus.REJECTED}
        cards={[]}
        onCardDrop={mockOnCardDrop}
        onDeleteCard={mockOnDeleteCard}
        onEditCard={mockOnEditCard}
      />
    );
    expect(screen.getByText('已拒绝')).toBeInTheDocument();
  });

  test('displays correct card count', () => {
    render(
      <StatusColumn
        status={CardStatus.TODO}
        cards={mockCards}
        onCardDrop={mockOnCardDrop}
        onDeleteCard={mockOnDeleteCard}
        onEditCard={mockOnEditCard}
      />
    );
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('renders cards correctly', () => {
    render(
      <StatusColumn
        status={CardStatus.TODO}
        cards={mockCards}
        onCardDrop={mockOnCardDrop}
        onDeleteCard={mockOnDeleteCard}
        onEditCard={mockOnEditCard}
      />
    );
    expect(screen.getByTestId('card-1')).toBeInTheDocument();
    expect(screen.getByTestId('card-2')).toBeInTheDocument();
    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('Card 2')).toBeInTheDocument();
  });

  test('renders status column with correct base styles', () => {
    const { container } = render(
      <StatusColumn
        status={CardStatus.TODO}
        cards={[]}
        onCardDrop={mockOnCardDrop}
        onDeleteCard={mockOnDeleteCard}
        onEditCard={mockOnEditCard}
      />
    );
    const columnElement = container.querySelector('.status-column');
    expect(columnElement).toBeInTheDocument();
  });
});
