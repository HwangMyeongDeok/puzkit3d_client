'use client';

import { Provider } from 'react-redux';
import { ReactNode, useEffect, useRef } from 'react';

import { persistor, store } from '@/stores/store';
import { initializeAuth, setLoading } from '@/stores/slices/authSlice';
import { APP_CONFIG } from '@/constants';
import { PersistGate } from 'redux-persist/integration/react';

interface ReduxProviderProps {
  children: ReactNode;
}

function StoreInitializer({ children }: { children: ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    try {
      const storedUser = localStorage.getItem(APP_CONFIG.AUTH_STORAGE_KEY);

      // Helper đọc Cookie
      const getCookie = (name: string) =>
        document.cookie
          .split('; ')
          .find((row) => row.startsWith(name + '='))
          ?.split('=')[1];

      // Chỉ cần check xem Access Token còn tồn tại trong Cookie không
      const hasAccessToken = !!getCookie(APP_CONFIG.ACCESS_TOKEN_KEY);

      // Nếu có CẢ user cache và Token chưa hết hạn thì mới khôi phục state
      if (storedUser && hasAccessToken) {
        let user: any = null;
        try {
          const parsed = JSON.parse(storedUser);
          user = parsed.user || parsed; // Support data cũ và mới
        } catch {}

        // Bỏ accessToken và refreshToken đi, Redux giờ chỉ quản lý UI User
        store.dispatch(
          initializeAuth({
            user,
          })
        );
      } else {
        store.dispatch(setLoading(false));
      }
    } catch (error) {
      console.error('Auth Hydration Error:', error);
      store.dispatch(setLoading(false));
    }
  }, []);

  return <>{children}</>;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StoreInitializer>{children}</StoreInitializer>
      </PersistGate>
    </Provider>
  );
}
