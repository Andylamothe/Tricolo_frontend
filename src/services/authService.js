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
  const { username, password, email } = credentials;
  
  // Use username if provided, otherwise fallback to email
  const loginUsername = username || email;

  if (!loginUsername || !password) {
    throw new Error('Nom d\'utilisateur et mot de passe requis');
  }

  try {
    const response = await api.post('/admin/login', {
      username: loginUsername,
      password
    });

    if (!response.accessToken) {
      throw new Error('Token non reçu du serveur');
    }

    setToken(response.accessToken);
    
    // Return user info based on response
    return { 
      token: response.accessToken, 
      user: { 
        id: response.id,
        username: response.username,
        email: response.email,
        role: 'admin' 
      } 
    };
  } catch (error) {
    throw new Error(error.message || 'Erreur de connexion');
  }
}

export async function logout() {
  clearToken();
  try {
    await api.post('/admin/logout', {});
  } catch {
    // Ignore si l'endpoint n'existe pas encore
  }
}
