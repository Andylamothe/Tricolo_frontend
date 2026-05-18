import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPage from '../../pages/AdminPage';
import { api } from '../../services/api';

jest.mock('../../services/api', () => ({
  api: {
    getAllNotifs: jest.fn(),
    updateNotif: jest.fn(),
  },
}));

jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

const { useAuth: mockUseAuth } = require('../../hooks/useAuth');

describe('AdminPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render admin page', () => {
      mockUseAuth.mockReturnValue({
        login: jest.fn(),
        isAuthenticated: false,
        logout: jest.fn(),
      });

      render(<AdminPage />);

      // When not authenticated, shows login form
      expect(screen.getByText('Tricolo Admin')).toBeInTheDocument();
    });

    it('should display admin title', () => {
      mockUseAuth.mockReturnValue({
        login: jest.fn(),
        isAuthenticated: false,
        logout: jest.fn(),
      });

      render(<AdminPage />);

      expect(screen.getByText('Tricolo Admin')).toBeInTheDocument();
    });

    it('should display bins container when authenticated', () => {
      mockUseAuth.mockReturnValue({
        login: jest.fn(),
        isAuthenticated: true,
        logout: jest.fn(),
      });
      api.getAllNotifs.mockResolvedValueOnce([]);

      render(<AdminPage />);

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('Gestion des Poubelles')).toBeInTheDocument();
    });
  });

  describe('login form', () => {
    it('should render login form initially', () => {
      mockUseAuth.mockReturnValue({
        login: jest.fn(),
        isAuthenticated: false,
        logout: jest.fn(),
      });

      render(<AdminPage />);

      // Query by placeholder text since labels aren't properly associated
      expect(screen.getByPlaceholderText(/Entrez votre nom d'utilisateur/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Entrez votre mot de passe/i)).toBeInTheDocument();
    });

    it('should handle login form submission', async () => {
      const user = userEvent.setup();
      const mockLogin = jest.fn().mockResolvedValue({ user: { email: 'admin@test.com' } });

      mockUseAuth.mockReturnValue({
        login: mockLogin,
        isAuthenticated: false,
        logout: jest.fn(),
      });

      render(<AdminPage />);

      const usernameInput = screen.getByPlaceholderText(/Entrez votre nom d'utilisateur/i);
      const passwordInput = screen.getByPlaceholderText(/Entrez votre mot de passe/i);
      const submitButton = screen.getByRole('button', { name: /Se connecter/i });

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(
          expect.objectContaining({
            username: 'admin',
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
        isAuthenticated: false,
        logout: jest.fn(),
      });

      render(<AdminPage />);

      const usernameInput = screen.getByPlaceholderText(/Entrez votre nom d'utilisateur/i);
      const passwordInput = screen.getByPlaceholderText(/Entrez votre mot de passe/i);
      const submitButton = screen.getByRole('button', { name: /Se connecter/i });

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'wrongpass');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should show loading state during login', async () => {
      const user = userEvent.setup();
      let resolveLogin;
      const mockLogin = jest.fn(
        () => new Promise(resolve => { resolveLogin = resolve; })
      );

      mockUseAuth.mockReturnValue({
        login: mockLogin,
        isAuthenticated: false,
        logout: jest.fn(),
      });

      render(<AdminPage />);

      const usernameInput = screen.getByPlaceholderText(/Entrez votre nom d'utilisateur/i);
      const passwordInput = screen.getByPlaceholderText(/Entrez votre mot de passe/i);
      const submitButton = screen.getByRole('button', { name: /Se connecter/i });

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();

      resolveLogin({ user: { email: 'admin@test.com' } });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('bin display', () => {
    it('should render bin containers when authenticated', () => {
      mockUseAuth.mockReturnValue({
        login: jest.fn(),
        isAuthenticated: true,
        logout: jest.fn(),
      });
      api.getAllNotifs.mockResolvedValueOnce([]);

      render(<AdminPage />);

      // Check for all 4 bin names
      expect(screen.getByText('Bac Recyclage')).toBeInTheDocument();
      expect(screen.getByText('Bac Compost')).toBeInTheDocument();
      expect(screen.getByText('Bac Déchets')).toBeInTheDocument();
      expect(screen.getByText('Bac Autres Déchets')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should display a full alert for bins above the threshold', async () => {
      mockUseAuth.mockReturnValue({
        login: jest.fn(),
        isAuthenticated: true,
        logout: jest.fn(),
      });
      api.getAllNotifs.mockResolvedValueOnce([]);

      render(<AdminPage />);

      await waitFor(() => {
        expect(screen.getByText(/Ce bac là est plein/i)).toBeInTheDocument();
      });
    });

    it('should empty a full bin and call the notification API', async () => {
      const user = userEvent.setup();

      mockUseAuth.mockReturnValue({
        login: jest.fn(),
        isAuthenticated: true,
        logout: jest.fn(),
      });
      api.getAllNotifs.mockResolvedValueOnce([
        { categoriePoubelle: 'poubelle', isFull: true, notifIsSent: false },
      ]);
      api.updateNotif.mockResolvedValueOnce({ message: 'Notification mise à jour' });

      render(<AdminPage />);

      await waitFor(() => {
        expect(screen.getByText(/Ce bac là est plein/i)).toBeInTheDocument();
      });

      const fullCard = screen.getByText('Bac Déchets').closest('article');
      const emptyButton = within(fullCard).getByRole('button', { name: /Vider le Bac Déchets/i });

      await user.click(emptyButton);

      await waitFor(() => {
        expect(api.updateNotif).toHaveBeenCalledWith(
          'poubelle',
          expect.objectContaining({
            categoriePoubelle: 'poubelle',
            isFull: false,
            notifIsSent: true,
          })
        );
      });

      expect(screen.getByText(/a été vidé/i)).toBeInTheDocument();
      expect(screen.queryByText(/Ce bac là est plein/i)).not.toBeInTheDocument();
    });
  });

  describe('password toggle', () => {
    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue({
        login: jest.fn(),
        isAuthenticated: false,
        logout: jest.fn(),
      });

      render(<AdminPage />);

      const passwordInput = screen.getByPlaceholderText(/Entrez votre mot de passe/i);
      expect(passwordInput).toHaveAttribute('type', 'password');

      const toggleButton = screen.getByRole('button', { name: /👁️/i });

      await user.click(toggleButton);

      await waitFor(() => {
        const updatedPasswordInput = screen.getByPlaceholderText(/Entrez votre mot de passe/i);
        expect(updatedPasswordInput).toHaveAttribute('type', 'text');
      });
    });
  });

  describe('form labels', () => {
    it('should have proper form labels for accessibility', () => {
      mockUseAuth.mockReturnValue({
        login: jest.fn(),
        isAuthenticated: false,
        logout: jest.fn(),
      });

      render(<AdminPage />);

      // Labels should be visible in the document
      expect(screen.getByText(/Nom d'utilisateur/i)).toBeInTheDocument();
      expect(screen.getByText(/Mot de passe/i)).toBeInTheDocument();
    });
  });

  describe('logo', () => {
    it('should display logo image', () => {
      mockUseAuth.mockReturnValue({
        login: jest.fn(),
        isAuthenticated: false,
        logout: jest.fn(),
      });

      render(<AdminPage />);

      const logoImg = screen.getByAltText('Tricolo');
      expect(logoImg).toBeInTheDocument();
      expect(logoImg).toHaveAttribute('src', '/logoTricolo.png');
    });
  });
});
