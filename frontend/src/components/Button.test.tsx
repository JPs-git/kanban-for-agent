import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  test('renders button with children', () => {
    render(<Button>Test Button</Button>);
    const buttonElement = screen.getByText('Test Button');
    expect(buttonElement).toBeInTheDocument();
  });

  test('applies correct variant classes', () => {
    const variantClasses: Record<string, string> = {
      primary: 'bg-primary-500',
      success: 'bg-success-500',
      danger: 'bg-danger-500',
      secondary: 'bg-gray-100',
    };
    const variants = ['primary', 'success', 'danger', 'secondary'] as const;
    variants.forEach(variant => {
      const { container } = render(<Button variant={variant}>Test</Button>);
      const buttonElement = container.querySelector('button');
      expect(buttonElement).toHaveClass(variantClasses[variant]);
    });
  });

  test('applies correct size classes', () => {
    const sizeClasses: Record<string, string> = {
      small: 'h-8',
      medium: 'h-9',
      large: 'h-11',
    };
    const sizes = ['small', 'medium', 'large'] as const;
    sizes.forEach(size => {
      const { container } = render(<Button size={size}>Test</Button>);
      const buttonElement = container.querySelector('button');
      expect(buttonElement).toHaveClass(sizeClasses[size]);
    });
  });

  test('applies disabled styles when disabled prop is true', () => {
    render(<Button disabled>Test</Button>);
    const buttonElement = screen.getByText('Test');
    expect(buttonElement).toBeDisabled();
  });

  test('does not apply disabled styles when disabled prop is false', () => {
    render(<Button disabled={false}>Test</Button>);
    const buttonElement = screen.getByText('Test');
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
    expect(buttonElement).toHaveClass('bg-primary-500');
    expect(buttonElement).toHaveClass('h-9');
    expect(buttonElement).not.toBeDisabled();
    expect(buttonElement).toHaveAttribute('type', 'button');
  });
});
