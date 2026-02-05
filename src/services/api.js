import { API_BASE_URL } from '../utils/constants';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'API error');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
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
};
