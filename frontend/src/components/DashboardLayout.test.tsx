import { render, screen } from '@testing-library/react';
import DashboardLayout from './DashboardLayout';
import Button from './Button';

describe('DashboardLayout Component', () => {
  test('renders children content', () => {
    render(
      <DashboardLayout>
        <div data-testid="content">Test Content</div>
      </DashboardLayout>
    );
    const contentElement = screen.getByTestId('content');
    expect(contentElement).toBeInTheDocument();
    expect(contentElement).toHaveTextContent('Test Content');
  });

  test('renders actions when provided', () => {
    render(
      <DashboardLayout actions={<Button>Action</Button>}>
        <div>Test Content</div>
      </DashboardLayout>
    );
    const actionButton = screen.getByText('Action');
    expect(actionButton).toBeInTheDocument();
  });

  test('does not render actions when not provided', () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('applies h-full class to container', () => {
    const { container } = render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );
    const layoutContainer = container.firstChild;
    expect(layoutContainer).toHaveClass('h-full');
  });

  test('has correct flex-col layout', () => {
    const { container } = render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );
    const layoutContainer = container.firstChild;
    expect(layoutContainer).toHaveClass('flex-col');
  });

  test('applies gradient background', () => {
    const { container } = render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );
    const layoutContainer = container.firstChild;
    expect(layoutContainer).toHaveClass('bg-gradient-to-br');
  });

  test('renders actions at the top', () => {
    const { container } = render(
      <DashboardLayout actions={<Button>Action</Button>}>
        <div data-testid="content">Content</div>
      </DashboardLayout>
    );
    const actionButton = container.querySelector('button');
    const content = screen.getByTestId('content');
    expect(actionButton?.compareDocumentPosition(content)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });
});