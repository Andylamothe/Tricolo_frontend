import * as authService from '../authService';
import * as api from '../api';

jest.mock('../api');

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
      const credentials = { email: 'test@test.com', password: 'password123' };

      const result = await authService.login(credentials);

      expect(result).toEqual({
        token: expect.any(String),
        user: {
          email: credentials.email,
          role: 'admin',
        },
      });
    });

    it('should store token on successful login', async () => {
      const credentials = { email: 'test@test.com', password: 'password123' };

      await authService.login(credentials);

      expect(authService.getToken()).toBeTruthy();
    });

    it('should throw error when email is missing', async () => {
      const credentials = { password: 'password123' };

      await expect(authService.login(credentials)).rejects.toThrow(
        'Email et mot de passe requis'
      );
    });

    it('should throw error when password is missing', async () => {
      const credentials = { email: 'test@test.com' };

      await expect(authService.login(credentials)).rejects.toThrow(
        'Email et mot de passe requis'
      );
    });

    it('should throw error when both email and password are missing', async () => {
      await expect(authService.login({})).rejects.toThrow(
        'Email et mot de passe requis'
      );
    });

    it('should set mock token on login', async () => {
      localStorage.clear();
      const credentials = { email: 'admin@test.com', password: 'pass' };

      await authService.login(credentials);

      expect(authService.getToken()).toBe('mock-admin-token');
    });

    it('should return user with email from credentials', async () => {
      const credentials = { email: 'custom@email.com', password: 'pass' };

      const result = await authService.login(credentials);

      expect(result.user.email).toBe('custom@email.com');
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
      const credentials = { email: 'user@test.com', password: 'password' };
      const loginResult = await authService.login(credentials);

      expect(authService.getToken()).toBeTruthy();
      expect(loginResult.user.email).toBe('user@test.com');

      // Logout
      await authService.logout();

      expect(authService.getToken()).toBeNull();
    });

    it('should handle multiple login attempts', async () => {
      const firstLogin = await authService.login({
        email: 'first@test.com',
        password: 'pass1',
      });
      const firstToken = authService.getToken();

      const secondLogin = await authService.login({
        email: 'second@test.com',
        password: 'pass2',
      });
      const secondToken = authService.getToken();

      expect(firstToken).toBeTruthy();
      expect(secondToken).toBeTruthy();
      expect(firstLogin.user.email).toBe('first@test.com');
      expect(secondLogin.user.email).toBe('second@test.com');
    });
  });
});
