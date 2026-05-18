import { API_BASE_URL } from '../utils/constants';
import { getToken } from './authService';

async function request(path, options = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    // Add authorization token if available
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers,
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `API error: ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Request error:', error);
    throw error;
  }
}

export const api = {
  get: (path, options) => request(path, { method: 'GET', ...options }),
  post: (path, body, options) =>
    request(path, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    }),
  put: (path, body, options) =>
    request(path, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    }),
  // Frontend endpoints
  getAllDechets: () => api.get('/dechets'),
  getAllStats: () => api.get('/stats'),
  getAllNotifs: () => api.get('/notif'),
  createNotif: (body) => api.post('/notif', body),
  updateNotif: (categoriePoubelle, body) =>
    api.post(`/notif/${categoriePoubelle}`, body),
};
