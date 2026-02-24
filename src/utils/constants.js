// Get API base URL from environment
let API_BASE_URL;

// Try to get from Vite
try {
  // This will work in browser/Vite environment
  if (typeof globalThis !== 'undefined' && globalThis.__VITE_ENV_API_BASE_URL__) {
    API_BASE_URL = globalThis.__VITE_ENV_API_BASE_URL__;
  }
} catch (e) {
  // Fallback
}

// Fallback to environment variable or default
if (!API_BASE_URL) {
  API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://iotbackend-4ufq.onrender.com/api';
}

export { API_BASE_URL };


