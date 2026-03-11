
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  test('renders button with children', () => {
    render(<Button>Test Button</Button>);
    const buttonElement = screen.getByText('Test Button');
    expect(buttonElement).toBeInTheDocument();
  });

  test('applies correct variant classes', () => {
    const variants = ['primary', 'success', 'danger', 'secondary'] as const;
    variants.forEach(variant => {
      const { container } = render(<Button variant={variant}>Test</Button>);
      const buttonElement = container.querySelector('button');
      expect(buttonElement).toHaveClass(`btn-${variant}`);
    });
  });

  test('applies correct size classes', () => {
    const sizes = ['small', 'medium', 'large'] as const;
    sizes.forEach(size => {
      const { container } = render(<Button size={size}>Test</Button>);
      const buttonElement = container.querySelector('button');
      expect(buttonElement).toHaveClass(`btn-${size}`);
    });
  });

  test('applies disabled class when disabled prop is true', () => {
    render(<Button disabled>Test</Button>);
    const buttonElement = screen.getByText('Test');
    expect(buttonElement).toHaveClass('disabled');
    expect(buttonElement).toBeDisabled();
  });

  test('does not apply disabled class when disabled prop is false', () => {
    render(<Button disabled={false}>Test</Button>);
    const buttonElement = screen.getByText('Test');
    expect(buttonElement).not.toHaveClass('disabled');
    expect(buttonElement).not.toBeDisabled();
  });

  test('calls onClick handler when button is clicked', () => {
    const mockOnClick = vi.fn();
    render(<Button onClick={mockOnClick}>Test</Button>);
    const buttonElement = screen.getByText('Test');
    fireEvent.click(buttonElement);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test('applies additional className', () => {
    render(<Button className="custom-class">Test</Button>);
    const buttonElement = screen.getByText('Test');
    expect(buttonElement).toHaveClass('custom-class');
  });

  test('sets correct button type', () => {
    const types = ['button', 'submit', 'reset'] as const;
    types.forEach(type => {
      const { container } = render(<Button type={type}>Test</Button>);
      const buttonElement = container.querySelector('button');
      expect(buttonElement).toHaveAttribute('type', type);
    });
  });

  test('uses default props when not provided', () => {
    render(<Button>Test</Button>);
    const buttonElement = screen.getByText('Test');
    expect(buttonElement).toHaveClass('btn-primary');
    expect(buttonElement).toHaveClass('btn-medium');
    expect(buttonElement).not.toBeDisabled();
    expect(buttonElement).toHaveAttribute('type', 'button');
  });
});
