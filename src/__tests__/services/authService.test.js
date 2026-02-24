import * as authService from '../../services/authService';
import * as api from '../../services/api';

jest.mock('../../services/api');

const TOKEN_KEY = 'tricolo_token';

describe('Auth Service', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Token Management', () => {
    describe('getToken', () => {
      it('should return null when no token exists', () => {
        const token = authService.getToken();
        expect(token).toBeNull();
      });

      it('should return stored token from localStorage', () => {
        localStorage.setItem(TOKEN_KEY, 'test-token');
        const token = authService.getToken();
        expect(token).toBe('test-token');
      });
    });

    describe('setToken', () => {
      it('should store token in localStorage', () => {
        authService.setToken('new-token');
        expect(localStorage.getItem(TOKEN_KEY)).toBe('new-token');
      });

      it('should overwrite existing token', () => {
        authService.setToken('old-token');
        authService.setToken('new-token');
        expect(localStorage.getItem(TOKEN_KEY)).toBe('new-token');
      });
    });

    describe('clearToken', () => {
      it('should remove token from localStorage', () => {
        authService.setToken('test-token');
        authService.clearToken();
        expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      });

      it('should not throw error when no token exists', () => {
        expect(() => authService.clearToken()).not.toThrow();
      });
    });
  });

  describe('Login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = {
        accessToken: 'test-token-123',
        id: '1',
        username: 'testuser',
        email: 'test@test.com'
      };
      
      api.api.post.mockResolvedValueOnce(mockResponse);
      
      const credentials = { username: 'testuser', password: 'password123' };
      const result = await authService.login(credentials);

      expect(result).toEqual({
        token: 'test-token-123',
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@test.com',
          role: 'admin',
        },
      });
    });

    it('should accept email as fallback for username', async () => {
      const mockResponse = {
        accessToken: 'test-token-456',
        id: '2',
        username: 'test@test.com',
        email: 'test@test.com'
      };
      
      api.api.post.mockResolvedValueOnce(mockResponse);
      
      const credentials = { email: 'test@test.com', password: 'password123' };
      const result = await authService.login(credentials);

      expect(api.api.post).toHaveBeenCalledWith('/admin', {
        username: 'test@test.com',
        password: 'password123'
      });
      expect(result.token).toBe('test-token-456');
    });

    it('should store token on successful login', async () => {
      const mockResponse = {
        accessToken: 'stored-token',
        id: '1',
        username: 'user',
        email: 'user@test.com'
      };
      
      api.api.post.mockResolvedValueOnce(mockResponse);
      
      const credentials = { username: 'user', password: 'pass' };
      await authService.login(credentials);

      expect(authService.getToken()).toBe('stored-token');
    });

    it('should throw error when username/email is missing', async () => {
      const credentials = { password: 'password123' };

      await expect(authService.login(credentials)).rejects.toThrow(
        'Nom d\'utilisateur et mot de passe requis'
      );
    });

    it('should throw error when password is missing', async () => {
      const credentials = { username: 'testuser' };

      await expect(authService.login(credentials)).rejects.toThrow(
        'Nom d\'utilisateur et mot de passe requis'
      );
    });

    it('should throw error when both are missing', async () => {
      await expect(authService.login({})).rejects.toThrow(
        'Nom d\'utilisateur et mot de passe requis'
      );
    });

    it('should throw error when server does not return accessToken', async () => {
      api.api.post.mockResolvedValueOnce({
        id: '1',
        username: 'user'
        // Missing accessToken
      });

      const credentials = { username: 'user', password: 'pass' };

      await expect(authService.login(credentials)).rejects.toThrow(
        'Token non reçu du serveur'
      );
    });

    it('should call correct API endpoint', async () => {
      const mockResponse = {
        accessToken: 'token',
        id: '1',
        username: 'testuser',
        email: 'test@test.com'
      };
      
      api.api.post.mockResolvedValueOnce(mockResponse);
      
      const credentials = { username: 'testuser', password: 'pass123' };
      await authService.login(credentials);

      expect(api.api.post).toHaveBeenCalledWith('/admin', {
        username: 'testuser',
        password: 'pass123'
      });
    });
  });

  describe('Logout', () => {
    it('should clear token on logout', async () => {
      authService.setToken('test-token');
      expect(authService.getToken()).toBe('test-token');

      await authService.logout();

      expect(authService.getToken()).toBeNull();
    });

    it('should attempt to call logout API endpoint', async () => {
      authService.setToken('test-token');

      await authService.logout();

      expect(authService.getToken()).toBeNull();
    });

    it('should handle API errors gracefully', async () => {
      authService.setToken('test-token');
      api.api.post.mockRejectedValueOnce(new Error('API Error'));

      // Should not throw even if API fails
      await expect(authService.logout()).resolves.toBeUndefined();
      expect(authService.getToken()).toBeNull();
    });

    it('should clear token even if API call fails', async () => {
      authService.setToken('test-token');
      api.api.post.mockRejectedValueOnce(new Error('Network error'));

      await authService.logout();

      expect(authService.getToken()).toBeNull();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete auth flow: login and logout', async () => {
      // Initial state: no token
      expect(authService.getToken()).toBeNull();

      // Login
      const mockResponse = {
        accessToken: 'test-token',
        id: '1',
        username: 'user',
        email: 'user@test.com'
      };
      api.api.post.mockResolvedValueOnce(mockResponse);

      const credentials = { username: 'user', password: 'password' };
      const loginResult = await authService.login(credentials);

      expect(authService.getToken()).toBeTruthy();
      expect(loginResult.user.username).toBe('user');

      // Logout
      api.api.post.mockResolvedValueOnce(undefined);
      await authService.logout();

      expect(authService.getToken()).toBeNull();
    });

    it('should handle multiple login attempts', async () => {
      const mockResponse1 = {
        accessToken: 'token-1',
        id: '1',
        username: 'first',
        email: 'first@test.com'
      };
      
      const mockResponse2 = {
        accessToken: 'token-2',
        id: '2',
        username: 'second',
        email: 'second@test.com'
      };

      api.api.post.mockResolvedValueOnce(mockResponse1);
      const firstLogin = await authService.login({
        username: 'first',
        password: 'pass1',
      });
      const firstToken = authService.getToken();

      api.api.post.mockResolvedValueOnce(mockResponse2);
      const secondLogin = await authService.login({
        username: 'second',
        password: 'pass2',
      });
      const secondToken = authService.getToken();

      expect(firstToken).toBe('token-1');
      expect(secondToken).toBe('token-2');
      expect(firstLogin.user.username).toBe('first');
      expect(secondLogin.user.username).toBe('second');
    });
  });
});
