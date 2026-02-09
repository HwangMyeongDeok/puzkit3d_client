import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type {
  CartItem,
  CartState,
  AddToCartPayload,
  UpdateCartItemPayload,
  RemoveCartItemPayload,
} from '@/types';

const initialState: CartState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
};

const recalculateTotals = (state: CartState) => {
  state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
  state.totalPrice = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<AddToCartPayload>) => {
      const { productId, variant } = action.payload;
      const existingItem = state.items.find(
        (item) => item.productId === productId && item.variant === variant
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + action.payload.quantity;
        if (existingItem.maxQuantity && newQuantity > existingItem.maxQuantity) {
          existingItem.quantity = existingItem.maxQuantity;
        } else {
          existingItem.quantity = newQuantity;
        }
      } else {
        state.items.push(action.payload);
      }

      recalculateTotals(state);
    },

    removeFromCart: (state, action: PayloadAction<RemoveCartItemPayload>) => {
      const { productId, variant } = action.payload;
      state.items = state.items.filter(
        (item) => !(item.productId === productId && item.variant === variant)
      );
      recalculateTotals(state);
    },

    updateQuantity: (state, action: PayloadAction<UpdateCartItemPayload>) => {
      const { productId, variant, quantity } = action.payload;
      const item = state.items.find(
        (item) => item.productId === productId && item.variant === variant
      );

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(
            (i) => !(i.productId === productId && i.variant === variant)
          );
        } else if (item.maxQuantity && quantity > item.maxQuantity) {
          item.quantity = item.maxQuantity;
        } else {
          item.quantity = quantity;
        }
      }

      recalculateTotals(state);
    },

    incrementQuantity: (state, action: PayloadAction<RemoveCartItemPayload>) => {
      const { productId, variant } = action.payload;
      const item = state.items.find(
        (item) => item.productId === productId && item.variant === variant
      );

      if (item) {
        if (!item.maxQuantity || item.quantity < item.maxQuantity) {
          item.quantity += 1;
        }
      }

      recalculateTotals(state);
    },

    decrementQuantity: (state, action: PayloadAction<RemoveCartItemPayload>) => {
      const { productId, variant } = action.payload;
      const item = state.items.find(
        (item) => item.productId === productId && item.variant === variant
      );

      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          state.items = state.items.filter(
            (i) => !(i.productId === productId && i.variant === variant)
          );
        }
      }

      recalculateTotals(state);
    },

    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
    },

    loadCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      recalculateTotals(state);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  loadCart,
} = cartSlice.actions;

export default cartSlice.reducer;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartTotalQuantity = (state: { cart: CartState }) => state.cart.totalQuantity;
export const selectCartTotalPrice = (state: { cart: CartState }) => state.cart.totalPrice;
export const selectCartItemCount = (state: { cart: CartState }) => state.cart.items.length;
