// API configuration - centralizes API base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export const API_ROOT_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
