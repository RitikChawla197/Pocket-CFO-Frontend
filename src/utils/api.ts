const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
const BASE_URL = rawBaseUrl.replace(/\/+$/, '');

export const API_ENDPOINTS = {
  health: `${BASE_URL}/api/health`,
  register: `${BASE_URL}/api/auth/register`,
  login: `${BASE_URL}/api/auth/login`,
  userData: (userId: number) => `${BASE_URL}/api/user/${userId}/data`,
  saveUserData: `${BASE_URL}/api/user/data`,
  aiInsights: `${BASE_URL}/api/ai/insights`,
};

