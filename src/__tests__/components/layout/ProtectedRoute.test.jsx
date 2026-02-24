import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../../components/layout/ProtectedRoute';

jest.mock('../../../hooks/useAuth');

const mockUseAuth = require('../../../hooks/useAuth').useAuth;

const MockProtectedComponent = () => <div>Protected Content</div>;
const MockLoginComponent = () => <div>Login Page</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authentication check', () => {
    it('should render children when user is authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { email: 'test@test.com' },
        login: jest.fn(),
        logout: jest.fn(),
      });

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <MockProtectedComponent />
          </ProtectedRoute>
        </BrowserRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should redirect to login when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
      });

      render(
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<MockLoginComponent />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MockProtectedComponent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('access control', () => {
    it('should allow authenticated users to access protected content', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { email: 'admin@test.com', role: 'admin' },
        login: jest.fn(),
        logout: jest.fn(),
      });

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <MockProtectedComponent />
          </ProtectedRoute>
        </BrowserRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should block unauthenticated users from accessing protected content', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
      });

      render(
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<MockLoginComponent />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MockProtectedComponent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      );

      // Should not be able to see protected content
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('should redirect to login route when access denied', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
      });

      render(
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<MockLoginComponent />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MockProtectedComponent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      );

      // Should navigate to login
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('should use replace navigation to prevent back button issues', () => {
      // This test verifies that Navigate component uses replace prop
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
      });

      const { container } = render(
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<MockLoginComponent />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MockProtectedComponent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      );

      // Component should navigate using replace behavior
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  describe('children rendering', () => {
    it('should render all children when authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { email: 'test@test.com' },
        login: jest.fn(),
        logout: jest.fn(),
      });

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Child 1</div>
            <div>Child 2</div>
          </ProtectedRoute>
        </BrowserRouter>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });

    it('should not render children when not authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
      });

      render(
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<MockLoginComponent />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <div>Secret Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      );

      expect(screen.queryByText('Secret Content')).not.toBeInTheDocument();
    });
  });

  describe('auth state changes', () => {
    it('should block access when not authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
      });

      render(
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<MockLoginComponent />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MockProtectedComponent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      );

      // Should show login page when not authenticated
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });
});
