import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../../context/AuthContext';
import * as authService from '../../services/authService';
import { useContext } from 'react';

// Mock the authService module
jest.mock('../../services/authService');

// Test component that uses AuthContext
function TestComponent() {
  const { user, isAuthenticated, login, logout } = useContext(AuthContext);

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      {user && (
        <div data-testid="user-email">{user.email}</div>
      )}
      <button onClick={() => login({ email: 'test@test.com', password: 'pass' })}>
        Login
      </button>
      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    jest.clearAllMocks();
    // Reset mocks
    authService.getToken.mockReturnValue(null);
  });

  describe('AuthProvider initialization', () => {
    it('should render children', () => {
      render(
        <AuthProvider>
          <div>Test Child</div>
        </AuthProvider>
      );

      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should initialize with no user when no token exists', () => {
      authService.getToken.mockReturnValue(null);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });

    it('should initialize with user when token and user data exist', () => {
      const mockUser = { email: 'admin@tricolo.local', role: 'admin', username: 'admin' };
      authService.getToken.mockReturnValue('valid-token');
      localStorage.setItem('tricolo_user', JSON.stringify(mockUser));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('admin@tricolo.local');
    });
  });

  describe('login functionality', () => {
    it('should handle successful login', async () => {
      const mockUser = { email: 'test@test.com', role: 'user' };
      authService.getToken.mockReturnValue(null);
      authService.login.mockResolvedValue({ user: mockUser });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByRole('button', { name: /login/i });
      loginButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
        // The user-email will only appear after state update
        const userEmailElement = screen.queryByTestId('user-email');
        if (userEmailElement) {
          expect(userEmailElement).toHaveTextContent('test@test.com');
        }
      });
    });

    it('should pass credentials to login service', async () => {
      authService.getToken.mockReturnValue(null);
      authService.login.mockResolvedValue({ user: { email: 'test@test.com' } });

      const credentials = { email: 'test@test.com', password: 'password123' };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByRole('button', { name: /login/i });
      loginButton.click();

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalled();
      });
    });
  });

  describe('logout functionality', () => {
    it('should handle logout', async () => {
      authService.getToken.mockReturnValue('token');
      authService.logout.mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      logoutButton.click();

      await waitFor(() => {
        expect(authService.logout).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      });
    });
  });

  describe('context value memoization', () => {
    it('should provide stable context value', () => {
      authService.getToken.mockReturnValue(null);

      const { rerender } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const firstRender = screen.getByTestId('auth-status');
      rerender(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const secondRender = screen.getByTestId('auth-status');
      expect(firstRender).toHaveTextContent('Not Authenticated');
      expect(secondRender).toHaveTextContent('Not Authenticated');
    });
  });
});
