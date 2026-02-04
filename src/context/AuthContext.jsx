import { createContext, useCallback, useMemo, useState } from 'react';
import { getToken, login as loginService, logout as logoutService } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = getToken();
    return token ? { email: 'admin@tricolo.local', role: 'admin' } : null;
  });

  const isAuthenticated = Boolean(user);

  const login = useCallback(async (credentials) => {
    const result = await loginService(credentials);
    setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(async () => {
    await logoutService();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated, login, logout }),
    [user, isAuthenticated, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
