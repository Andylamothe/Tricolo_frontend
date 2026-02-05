import { api } from './api';

const TOKEN_KEY = 'tricolo_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(credentials) {
  // TODO: remplacer par l'appel backend quand les endpoints seront disponibles
  // Exemple attendu: await api.post('/auth/login', credentials)
  const { email, password } = credentials;

  if (!email || !password) {
    throw new Error('Email et mot de passe requis');
  }

  const mockToken = 'mock-admin-token';
  setToken(mockToken);
  return { token: mockToken, user: { email, role: 'admin' } };
}

export async function logout() {
  // TODO: appeler le backend si nécessaire
  clearToken();
  try {
    await api.post('/auth/logout', {});
  } catch {
    // Ignore si l'endpoint n'existe pas encore
  }
}
