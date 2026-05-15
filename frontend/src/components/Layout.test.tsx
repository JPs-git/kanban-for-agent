import { render, screen } from '@testing-library/react';
import Layout from './Layout';
import { MemoryRouter } from 'react-router-dom';

describe('Layout Component', () => {
  const renderWithRouter = (children: React.ReactNode) => {
    return render(
      <MemoryRouter>
        <Layout>{children}</Layout>
      </MemoryRouter>
    );
  };

  test('renders Header component', () => {
    renderWithRouter(<div>Test Content</div>);
    const headerElement = screen.getByRole('banner');
    expect(headerElement).toBeInTheDocument();
  });

  test('renders Header with Kanban Board title', () => {
    renderWithRouter(<div>Test Content</div>);
    const titleElement = screen.getByText('Kanban Board');
    expect(titleElement).toBeInTheDocument();
  });

  test('renders children content', () => {
    renderWithRouter(<div data-testid="content">Test Content</div>);
    const contentElement = screen.getByTestId('content');
    expect(contentElement).toBeInTheDocument();
    expect(contentElement).toHaveTextContent('Test Content');
  });

  test('renders navigation links', () => {
    renderWithRouter(<div>Test Content</div>);
    const homeLink = screen.getByText('Home');
    const aboutLink = screen.getByText('About');
    expect(homeLink).toBeInTheDocument();
    expect(aboutLink).toBeInTheDocument();
  });

  test('applies h-screen class to container', () => {
    const { container } = renderWithRouter(<div>Test Content</div>);
    const layoutContainer = container.firstChild;
    expect(layoutContainer).toHaveClass('h-screen');
  });

  test('has correct flex-col layout', () => {
    const { container } = renderWithRouter(<div>Test Content</div>);
    const layoutContainer = container.firstChild;
    expect(layoutContainer).toHaveClass('flex-col');
  });
});