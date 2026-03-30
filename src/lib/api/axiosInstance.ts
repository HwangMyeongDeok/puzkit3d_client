import axios from 'axios';
import type { Store } from '@reduxjs/toolkit';

// import { logout } from '@/stores/slices/authSlice'; // Không cần dùng nữa nếu bỏ forceLogout
import { APP_CONFIG } from '@/constants';

// ---------------------------------------------------------------------------
// injectStore pattern: avoids circular dependency by deferring store reference
// ---------------------------------------------------------------------------
let store: Store;

export const injectStore = (_store: Store) => {
  store = _store;
};

// ---------------------------------------------------------------------------
// Cookie Helpers
// ---------------------------------------------------------------------------
const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

const setCookie = (name: string, value: string, maxAge: number) => {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
};

// ĐÃ BỎ HÀM forceLogout Ở ĐÂY ĐỂ TRÁNH BỊ ĐÁ VĂNG LIÊN TỤC

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
// Request interceptor — attach Bearer token từ Cookie
// ---------------------------------------------------------------------------
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getCookie(APP_CONFIG.ACCESS_TOKEN_KEY);
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
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const authEndpoints = ['auth/login', 'auth/register', 'auth/refresh-token'];
    const isAuthRequest = authEndpoints.some((url) => originalRequest.url?.includes(url));

    // NẾU BỊ LỖI 401 VÀ KHÔNG PHẢI ĐANG Ở API LOGIN/REGISTER
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
        const refreshToken = getCookie(APP_CONFIG.REFRESH_TOKEN_KEY);

        // NẾU KHÔNG CÓ REFRESH TOKEN -> Trả về lỗi luôn, không forceLogout nữa
        if (!refreshToken) {
          return Promise.reject(error);
        }

        // TIẾN HÀNH GỌI API REFRESH TOKEN
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}auth/refresh-token`,
          { refreshToken },
          { headers: { 'ngrok-skip-browser-warning': 'true' } }
        );

        const accessToken = response.data.token || response.data.accessToken;
        const newRefreshToken = response.data.refreshToken;

        setCookie(APP_CONFIG.ACCESS_TOKEN_KEY, accessToken, 604800);
        if (newRefreshToken) {
          setCookie(APP_CONFIG.REFRESH_TOKEN_KEY, newRefreshToken, 2592000);
        }

        try {
          const { apiSlice } = await import('@/lib/api/apiSlice');
          store.dispatch(apiSlice.util.invalidateTags(['User']));
        } catch (importError) {
          console.warn('Could not invalidate User tag after token refresh');
        }

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // NẾU REFRESH TOKEN CŨNG HẾT HẠN HOẶC LỖI -> Trả về lỗi, không forceLogout nữa
        processQueue(refreshError as Error, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
