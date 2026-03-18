import type { Middleware } from '@reduxjs/toolkit';
import { APP_CONFIG } from '@/constants';
import type { RootState } from '../store';

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

const persistUser = debounce((state: RootState['auth']) => {
  try {
    if (state.isAuthenticated && state.user) {
      localStorage.setItem(
        APP_CONFIG.AUTH_STORAGE_KEY,
        JSON.stringify({
          user: state.user,
        })
      );
    } else if (!state.isLoading) {
      localStorage.removeItem(APP_CONFIG.AUTH_STORAGE_KEY);
    }
  } catch {}
}, 300);

export const persistMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const actionType = (action as { type: string }).type;

  if (typeof window !== 'undefined' && typeof actionType === 'string') {
    const state = store.getState() as RootState;

    if (actionType.startsWith('auth/')) {
      persistUser(state.auth);
    }

    if (actionType === 'auth/logout') {
      try {
        localStorage.removeItem(APP_CONFIG.AUTH_STORAGE_KEY);
      } catch {}
    }
  }

  return result;
};
