import { useAuth } from '../../hooks/useAuth';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

// Mock useContext
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successful usage', () => {
    it('should return auth context when used within AuthProvider', () => {
      const mockAuthContext = {
        user: { email: 'test@test.com', role: 'user' },
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
      };

      useContext.mockReturnValue(mockAuthContext);

      const result = useAuth();

      expect(result).toEqual(mockAuthContext);
      expect(useContext).toHaveBeenCalledWith(AuthContext);
    });

    it('should provide access to user data', () => {
      const mockUser = { email: 'admin@test.com', role: 'admin' };
      useContext.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
      });

      const { user } = useAuth();

      expect(user).toEqual(mockUser);
      expect(user.email).toBe('admin@test.com');
      expect(user.role).toBe('admin');
    });

    it('should provide access to authentication status', () => {
      useContext.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
      });

      const { isAuthenticated } = useAuth();

      expect(isAuthenticated).toBe(false);
    });

    it('should provide login function', () => {
      const mockLogin = jest.fn();
      useContext.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: mockLogin,
        logout: jest.fn(),
      });

      const { login } = useAuth();

      expect(login).toBe(mockLogin);
    });

    it('should provide logout function', () => {
      const mockLogout = jest.fn();
      useContext.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: jest.fn(),
        logout: mockLogout,
      });

      const { logout } = useAuth();

      expect(logout).toBe(mockLogout);
    });
  });

  describe('error handling', () => {
    it('should throw error when used outside AuthProvider', () => {
      useContext.mockReturnValue(null);

      expect(() => {
        useAuth();
      }).toThrow('useAuth doit être utilisé dans AuthProvider');
    });

    it('should throw descriptive error message', () => {
      useContext.mockReturnValue(undefined);

      try {
        useAuth();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('AuthProvider');
      }
    });
  });

  describe('context usage', () => {
    it('should read from AuthContext', () => {
      const mockAuthValue = {
        user: { email: 'test@test.com' },
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
      };

      useContext.mockReturnValue(mockAuthValue);

      useAuth();

      expect(useContext).toHaveBeenCalledWith(AuthContext);
      expect(useContext).toHaveBeenCalledTimes(1);
    });
  });
});
