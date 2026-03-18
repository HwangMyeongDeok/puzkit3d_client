import axios from 'axios';
import type { Store } from '@reduxjs/toolkit';

import { logout, updateAccessToken } from '@/stores/slices/authSlice';

// ---------------------------------------------------------------------------
// injectStore pattern: avoids circular dependency by deferring store reference
// ---------------------------------------------------------------------------
let store: Store;

export const injectStore = (_store: Store) => {
  store = _store;
};

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// ---------------------------------------------------------------------------
// Token refresh queue (prevents multiple concurrent refresh calls)
// ---------------------------------------------------------------------------
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ---------------------------------------------------------------------------
// Request interceptor — attach Bearer token
// ---------------------------------------------------------------------------
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store?.getState()?.auth?.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response interceptor — handle 401 + token refresh
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Response interceptor — handle 401 + token refresh
// ---------------------------------------------------------------------------
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Định nghĩa các URL không được phép tự động refresh (Blacklist)
    // Sếp kiểm tra lại các path này cho khớp với Backend của sếp nhé
    const authEndpoints = ['auth/login', 'auth/register', 'auth/refresh-token'];
    const isAuthRequest = authEndpoints.some((url) => originalRequest.url?.includes(url));

    // 2. Chỉ xử lý Refresh Token nếu:
    // - Lỗi status là 401 (Unauthorized)
    // - Request này chưa được retry lần nào (_retry)
    // - KHÔNG PHẢI là các request trong Blacklist (isAuthRequest)
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = store?.getState()?.auth?.refreshToken;

        // Nếu không có refreshToken thì logout luôn cho rồi
        if (!refreshToken) {
          store.dispatch(logout());
          return Promise.reject(error); // Trả về lỗi 401 gốc
        }

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}auth/refresh-token`,
          { refreshToken },
          {
            headers: { 'ngrok-skip-browser-warning': 'true' },
          }
        );

        // Chỗ này sếp check xem BE trả về là "accessToken" hay "token" nhé
        const { accessToken } = response.data;

        store.dispatch(updateAccessToken(accessToken));
        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Nếu API refresh cũng lỗi (hết hạn hoàn toàn), xóa sạch và bắt login lại
        processQueue(refreshError as Error, null);
        store.dispatch(logout());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 3. Nếu không rơi vào các trường hợp trên, trả về lỗi gốc cho UI (LoginForm/RegisterForm)
    return Promise.reject(error);
  }
);

export default axiosInstance;
