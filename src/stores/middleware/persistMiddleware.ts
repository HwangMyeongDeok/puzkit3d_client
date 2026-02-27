import type { Middleware } from '@reduxjs/toolkit';

import { APP_CONFIG } from '@/constants';
import type { RootState } from '../store';

function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

const persistAuth = debounce((state: RootState['auth']) => {
  try {
    if (state.isAuthenticated && state.accessToken) {
      localStorage.setItem(
        APP_CONFIG.AUTH_STORAGE_KEY,
        JSON.stringify({
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
        })
      );
    } else if (!state.isLoading) {
      localStorage.removeItem(APP_CONFIG.AUTH_STORAGE_KEY);
    }
  } catch {}
}, 300);

const persistCart = debounce((items: RootState['cart']['items']) => {
  try {
    localStorage.setItem(APP_CONFIG.CART_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}, 300);

const authActions = [
  'auth/setCredentials',
  'auth/updateAccessToken',
  'auth/updateUser',
  'auth/logout',
  'auth/initializeAuth',
];

const cartActions = [
  'cart/addToCart',
  'cart/removeFromCart',
  'cart/updateQuantity',
  'cart/incrementQuantity',
  'cart/decrementQuantity',
  'cart/clearCart',
  'cart/loadCart',
];

export const persistMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const actionType = (action as { type: string }).type;

  if (typeof window !== 'undefined') {
    const state = store.getState() as RootState;

    if (authActions.includes(actionType)) {
      persistAuth(state.auth);
    }

    if (cartActions.includes(actionType)) {
      persistCart(state.cart.items);
    }
  }

  return result;
};
