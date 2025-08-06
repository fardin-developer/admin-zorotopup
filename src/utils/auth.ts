// Authentication utility functions

export interface User {
  name: string;
  email: string;
}

// Get stored authentication token
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Get stored user information
export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  const isAuth = localStorage.getItem('isAuthenticated') === 'true';
  return !!(token && isAuth);
};

// Clear authentication data (logout)
export const clearAuth = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('isAuthenticated');
};

// Make authenticated API request
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();

  if (!token) {
    throw new Error('No authentication token available');
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  // Only add Content-Type if not FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Merge with any existing headers
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

function getRootDomain(hostname: string) {
  const parts = hostname.split('.').filter(Boolean);
  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }
  return hostname;
}

function getApiBaseUrl() {
  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000/api/v1';
  }

  const rootDomain = getRootDomain(hostname);
  return `https://api.${rootDomain}/api/v1`;
}

export const domain = getApiBaseUrl();

// API base URL
export const API_BASE_URL = 'https://game.cptopup.in/api/v1';

// Common API endpoints
export const API_ENDPOINTS = {
  // User endpoints
  SEND_OTP: `${API_BASE_URL}/admin/send-otp`,
  VERIFY_OTP: `${API_BASE_URL}/admin/verify-otp`,

  // Admin endpoints
  ADMIN_DASHBOARD: `${API_BASE_URL}/admin/dashboard`,
  ADMIN_API_BALANCE: `${API_BASE_URL}/admin/api-balance`,
  ADMIN_USERS: (params?: string) =>
    `${API_BASE_URL}/admin/users${params ? `?${params}` : ''}`,

  // Game endpoints
  GAMES_GET_ALL: `${API_BASE_URL}/games/get-all`,
  GAMES_CREATE: `${API_BASE_URL}/games/create`,
  GAMES_UPDATE: (id: string) => `${API_BASE_URL}/games/${id}`,
  GAMES_DELETE: (id: string) => `${API_BASE_URL}/games/${id}`,
  GAMES_GET_BY_ID: (id: string) => `${API_BASE_URL}/games/${id}`,
  GAMES_CREATE_DIAMOND_PACK: (gameId: string) =>
    `${API_BASE_URL}/games/${gameId}/diamond-pack`,
  GAMES_GET_DIAMOND_PACKS: (gameId: string) =>
    `${API_BASE_URL}/games/${gameId}/diamond-packs`,
  GAMES_GET_DIAMOND_PACK_BY_ID: (diamondPackId: string) =>
    `${API_BASE_URL}/games/diamond-pack/${diamondPackId}`,
  GAMES_UPDATE_DIAMOND_PACK: (diamondPackId: string) =>
    `${API_BASE_URL}/games/diamond-pack/${diamondPackId}`,
  GAMES_DELETE_DIAMOND_PACK: (diamondPackId: string) =>
    `${API_BASE_URL}/games/diamond-pack/${diamondPackId}`,
  MOOGOLD_PRODUCTS: `${API_BASE_URL}/moogold/product/list_product`,
  MOOGOLD_PRODUCT_DETAIL: `${API_BASE_URL}/moogold/product/product_detail`,
  SMILEONE_PRODUCTS: `${API_BASE_URL}/smileone/products`,

  // API providers endpoint
  API_LIST: `${API_BASE_URL}/api/list`,
};
