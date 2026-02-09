export { store, type RootState, type AppDispatch } from './store';
export { useAppDispatch, useAppSelector } from './hooks';

export {
  setCredentials,
  updateAccessToken,
  updateUser,
  logout,
  setLoading,
  initializeAuth,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAccessToken,
  selectAuthLoading,
} from './slices/authSlice';

export {
  addToCart,
  removeFromCart,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  loadCart,
  selectCartItems,
  selectCartTotalQuantity,
  selectCartTotalPrice,
  selectCartItemCount,
} from './slices/cartSlice';

export type { User, AuthState, AuthCredentials, CartItem, CartState } from '@/types';
