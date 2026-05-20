const viteApiBaseUrl = typeof globalThis !== 'undefined' ? globalThis.__VITE_ENV_API_BASE_URL__ : undefined;
const processApiBaseUrl = typeof globalThis !== 'undefined' ? globalThis.process?.env?.VITE_API_BASE_URL : undefined;

const resolvedApiBaseUrl = [viteApiBaseUrl, processApiBaseUrl].find(
  (value) => typeof value === 'string' && value.trim() !== '' && !/^%VITE_[A-Z0-9_]+%$/.test(value)
);

const API_BASE_URL = resolvedApiBaseUrl || 'https://iotbackend-4ufq.onrender.com/api';

export { API_BASE_URL };
