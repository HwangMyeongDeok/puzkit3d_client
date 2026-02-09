'use client';

import { Provider } from 'react-redux';
import { ReactNode, useEffect, useRef } from 'react';

import { store } from '@/stores/store';
import { initializeAuth } from '@/stores/slices/authSlice';
import { loadCart } from '@/stores/slices/cartSlice';
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
        store.dispatch(initializeAuth({ user, accessToken, refreshToken }));
      } else {
        store.dispatch(initializeAuth({ user: null, accessToken: null, refreshToken: null }));
      }
    } catch {
      store.dispatch(initializeAuth({ user: null, accessToken: null, refreshToken: null }));
    }

    try {
      const storedCart = localStorage.getItem(APP_CONFIG.CART_STORAGE_KEY);
      if (storedCart) {
        const cartItems = JSON.parse(storedCart);
        store.dispatch(loadCart(cartItems));
      }
    } catch {
      /* empty */
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
