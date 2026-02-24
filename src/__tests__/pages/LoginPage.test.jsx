import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';
import * as authService from '../../services/authService';

// Mock the navigate function
const mockNavigateFn = jest.fn();

jest.mock('../../services/authService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigateFn,
}));
jest.mock('../../hooks/useAuth');

const mockUseAuth = require('../../hooks/useAuth').useAuth;

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigateFn.mockClear();
  });

  describe('rendering', () => {
    it('should render login form with title', () => {
      mockUseAuth.mockReturnValue({
        login: jest.fn(),
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      expect(screen.getByText('Tricolo Admin')).toBeInTheDocument();
      expect(screen.getByText(/Connectez-vous/i)).toBeInTheDocument();
    });

    it('should render username and password inputs', () => {
      mockUseAuth.mockReturnValue({
        login: jest.fn(),
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      expect(screen.getByPlaceholderText(/Entrez votre nom d'utilisateur/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Entrez votre mot de passe/i)).toBeInTheDocument();
    });

    it('should render login and cancel buttons', () => {
      mockUseAuth.mockReturnValue({
        login: jest.fn(),
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Annuler/i })).toBeInTheDocument();
    });

    it('should render logo image', () => {
      mockUseAuth.mockReturnValue({
        login: jest.fn(),
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const logoImg = screen.getByAltText('Tricolo');
      expect(logoImg).toBeInTheDocument();
      expect(logoImg).toHaveAttribute('src', '/logoTricolo.png');
    });
  });

  describe('form interactions', () => {
    it('should update form state when user types', async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue({
        login: jest.fn(),
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const usernameInput = screen.getByPlaceholderText(/Entrez votre nom d'utilisateur/i);
      const passwordInput = screen.getByPlaceholderText(/Entrez votre mot de passe/i);

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');

      expect(usernameInput).toHaveValue('testuser');
      expect(passwordInput).toHaveValue('password123');
    });

    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue({
        login: jest.fn(),
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const passwordInput = screen.getByPlaceholderText(/Entrez votre mot de passe/i);
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Find and click the show password button by aria-label
      const toggleButton = screen.getByRole('button', { name: /Afficher|Masquer/i });

      await user.click(toggleButton);
      await waitFor(() => {
        const updatedPasswordInput = screen.getByPlaceholderText(/Entrez votre mot de passe/i);
        expect(updatedPasswordInput).toHaveAttribute('type', 'text');
      });
    });
  });

  describe('form submission', () => {
    it('should submit login form with credentials', async () => {
      const user = userEvent.setup();
      const mockLogin = jest.fn().mockResolvedValue({ user: { email: 'test@test.com' } });

      mockUseAuth.mockReturnValue({
        login: mockLogin,
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const usernameInput = screen.getByPlaceholderText(/Entrez votre nom d'utilisateur/i);
      const passwordInput = screen.getByPlaceholderText(/Entrez votre mot de passe/i);
      const submitButton = screen.getByRole('button', { name: /Se connecter/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(
          expect.objectContaining({
            username: 'testuser',
            password: 'password123'
          })
        );
      });
    });

    it('should display error message on login failure', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Identifiants invalides';
      const mockLogin = jest.fn().mockRejectedValue(new Error(errorMessage));

      mockUseAuth.mockReturnValue({
        login: mockLogin,
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const usernameInput = screen.getByPlaceholderText(/Entrez votre nom d'utilisateur/i);
      const passwordInput = screen.getByPlaceholderText(/Entrez votre mot de passe/i);
      const submitButton = screen.getByRole('button', { name: /Se connecter/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      let resolveLogin;
      const mockLogin = jest.fn(
        () => new Promise(resolve => { resolveLogin = resolve; })
      );

      mockUseAuth.mockReturnValue({
        login: mockLogin,
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const usernameInput = screen.getByPlaceholderText(/Entrez votre nom d'utilisateur/i);
      const passwordInput = screen.getByPlaceholderText(/Entrez votre mot de passe/i);
      const submitButton = screen.getByRole('button', { name: /Se connecter/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Button should be disabled during loading
      expect(submitButton).toBeDisabled();

      resolveLogin({ user: { email: 'test@test.com' } });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('cancel button', () => {
    it('should navigate to home when cancel is clicked', async () => {
      const user = userEvent.setup();

      mockUseAuth.mockReturnValue({
        login: jest.fn(),
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const cancelButton = screen.getByRole('button', { name: /Annuler/i });
      await user.click(cancelButton);

      expect(mockNavigateFn).toHaveBeenCalledWith('/');
    });
  });

  describe('accessibility', () => {
    it('should have proper form labels', () => {
      mockUseAuth.mockReturnValue({
        login: jest.fn(),
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      // Check for labels visible in the document
      expect(screen.getByText(/Nom d'utilisateur/i)).toBeInTheDocument();
      expect(screen.getByText(/Mot de passe/i)).toBeInTheDocument();
    });

    it('should have semantic form structure', () => {
      mockUseAuth.mockReturnValue({
        login: jest.fn(),
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      // Main role should be present
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should have password toggle with aria label', () => {
      mockUseAuth.mockReturnValue({
        login: jest.fn(),
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      // Toggle button should have aria-label for accessibility
      const toggleButton = screen.getByRole('button', { name: /Afficher|Masquer/i });
      expect(toggleButton).toBeInTheDocument();
    });
  });
});
