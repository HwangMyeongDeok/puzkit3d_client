'use client';

import { Provider } from 'react-redux';
import { ReactNode, useEffect, useRef } from 'react';

import { store } from '@/stores/store';
import { initializeAuth, setLoading } from '@/stores/slices/authSlice';
import { APP_CONFIG } from '@/constants';

interface ReduxProviderProps {
  children: ReactNode;
}

function StoreInitializer({ children }: { children: ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    try {
      const storedAuth = localStorage.getItem(APP_CONFIG.AUTH_STORAGE_KEY);

      if (storedAuth) {
        const { user, accessToken, refreshToken } = JSON.parse(storedAuth);

        store.dispatch(
          initializeAuth({
            user,
            accessToken,
            refreshToken,
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
      <StoreInitializer>{children}</StoreInitializer>
    </Provider>
  );
}
