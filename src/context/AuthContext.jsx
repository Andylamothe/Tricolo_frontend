import { createContext, useCallback, useMemo, useState } from 'react';
import { getToken, login as loginService, logout as logoutService } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = getToken();
    // Try to get user info from localStorage if token exists
    const savedUser = localStorage.getItem('tricolo_user');
    return token && savedUser ? JSON.parse(savedUser) : null;
  });

  const isAuthenticated = Boolean(user);

  const login = useCallback(async (credentials) => {
    const result = await loginService(credentials);
    setUser(result.user);
    // Store user info in localStorage
    localStorage.setItem('tricolo_user', JSON.stringify(result.user));
    return result;
  }, []);

  const logout = useCallback(async () => {
    await logoutService();
    setUser(null);
    localStorage.removeItem('tricolo_user');
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated, login, logout }),
    [user, isAuthenticated, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
