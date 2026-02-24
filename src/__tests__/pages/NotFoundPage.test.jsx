import { render, screen } from '@testing-library/react';
import NotFoundPage from '../../pages/NotFoundPage';

describe('NotFoundPage', () => {
  describe('rendering', () => {
    it('should render 404 page', () => {
      render(<NotFoundPage />);

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should display "Page introuvable" heading', () => {
      render(<NotFoundPage />);

      expect(screen.getByRole('heading', { name: /Page introuvable/i })).toBeInTheDocument();
    });

    it('should display helpful message', () => {
      render(<NotFoundPage />);

      expect(screen.getByText(/Cette page n'existe pas/i)).toBeInTheDocument();
    });
  });

  describe('content', () => {
    it('should render in main element with padding', () => {
      render(<NotFoundPage />);

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveStyle({ padding: '24px' });
    });

    it('should display error message text', () => {
      render(<NotFoundPage />);

      const errorMessage = screen.getByText(/Cette page n'existe pas/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('semantics', () => {
    it('should use semantic heading element', () => {
      render(<NotFoundPage />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Page introuvable');
    });

    it('should use semantic main element', () => {
      render(<NotFoundPage />);

      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });
});
