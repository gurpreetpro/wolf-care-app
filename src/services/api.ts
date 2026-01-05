import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import Constants from 'expo-constants';

// Get API URL from app config (app.json/eas.json) or default to dev
const getBaseUrl = () => {
  // Check for API URL in extra config (from app.config.js or app.json)
  const apiUrl = Constants.expoConfig?.extra?.apiUrl;
  
  if (apiUrl) {
    return apiUrl;
  }

  // Fallbacks for local development if no config is present
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
};

const BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout for cloud
});

// Request Interceptor - Add Token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('auth_user');
      console.log('[api]: Session expired, credentials cleared');
    }

    // Handle network errors
    if (!error.response) {
      console.error('[api]: Network error:', error.message);
    }

    // Handle server errors (5xx)
    if (error.response?.status >= 500) {
      console.error('[api]: Server error:', error.response.status);
    }

    return Promise.reject(error);
  }
);

export const API_BASE_URL = BASE_URL;
export default api;
