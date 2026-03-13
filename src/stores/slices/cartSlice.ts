import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import type {
  CartItem,
  CartState,
  AddToCartPayload,
  UpdateCartItemPayload,
  RemoveCartItemPayload,
} from '@/types';
import {
  fetchCart as apiFetchCart,
  syncGuestCart as apiSyncGuestCart,
  addItemToServer,
  updateItemQty,
  removeItemFromServer,
  clearServerCart,
} from '@/lib/api/cartService';

export const fetchServerCart = createAsyncThunk('cart/fetchServerCart', async () => {
  const response = await apiFetchCart();
  if (!response.success) throw new Error(response.error || 'Failed to fetch cart');
  return response.data;
});

export const mergeCartOnLogin = createAsyncThunk(
  'cart/mergeCartOnLogin',
  async (_, { getState }) => {
    const state = getState() as { cart: CartState };
    const localItems = state.cart.items;
    const response = await apiSyncGuestCart(localItems);
    if (!response.success) throw new Error(response.error || 'Failed to merge cart');
    return response.data;
  }
);

export const addToCartServer = createAsyncThunk(
  'cart/addToCartServer',
  async (item: AddToCartPayload) => {
    const cartItem: CartItem = {
      id: `ci-${Date.now()}`,
      cartId: 'server-cart',
      ...item,
    };
    const response = await addItemToServer(cartItem);
    if (!response.success) throw new Error(response.error || 'Failed to add item');
    return response.data;
  }
);

export const syncItemToServer = createAsyncThunk(
  'cart/syncItemToServer',
  async (
    payload: { itemId: string; quantity: number; sku: string | null },
    { rejectWithValue }
  ) => {
    const { itemId, quantity, sku } = payload;
    const response =
      quantity <= 0
        ? await removeItemFromServer(itemId, sku)
        : await updateItemQty(itemId, quantity, sku);

    if (!response.success) {
      return rejectWithValue(response.error || 'Sync failed');
    }
    return response.data;
  }
);

export const removeFromCartServer = createAsyncThunk(
  'cart/removeFromCartServer',
  async (payload: { itemId: string; sku: string | null }) => {
    const response = await removeItemFromServer(payload.itemId, payload.sku);
    if (!response.success) throw new Error(response.error || 'Failed to remove item');
    return response.data;
  }
);

export const clearCartServer = createAsyncThunk('cart/clearCartServer', async () => {
  const response = await clearServerCart();
  if (!response.success) throw new Error(response.error || 'Failed to clear cart');
  return response.data;
});

const initialState: CartState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
  syncStatus: 'idle',
};

const recalculateTotals = (state: CartState) => {
  state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
  state.totalPrice = state.items.reduce(
    (sum, item) => sum + (item.unitPrice ?? 0) * item.quantity,
    0
  );
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<AddToCartPayload>) => {
      const { itemId, sku } = action.payload;
      const existingItem = state.items.find((item) => item.itemId === itemId && item.sku === sku);

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push({
          id: `ci-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          cartId: 'local',
          ...action.payload,
        });
      }

      recalculateTotals(state);
    },

    removeFromCart: (state, action: PayloadAction<RemoveCartItemPayload>) => {
      const { itemId, sku } = action.payload;
      state.items = state.items.filter((item) => !(item.itemId === itemId && item.sku === sku));
      recalculateTotals(state);
    },

    updateQuantity: (state, action: PayloadAction<UpdateCartItemPayload>) => {
      const { itemId, sku, quantity } = action.payload;
      const item = state.items.find((item) => item.itemId === itemId && item.sku === sku);

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => !(i.itemId === itemId && i.sku === sku));
        } else {
          item.quantity = quantity;
        }
      }

      recalculateTotals(state);
    },

    incrementQuantity: (state, action: PayloadAction<RemoveCartItemPayload>) => {
      const { itemId, sku } = action.payload;
      const item = state.items.find((item) => item.itemId === itemId && item.sku === sku);

      if (item) {
        item.quantity += 1;
      }

      recalculateTotals(state);
    },

    decrementQuantity: (state, action: PayloadAction<RemoveCartItemPayload>) => {
      const { itemId, sku } = action.payload;
      const item = state.items.find((item) => item.itemId === itemId && item.sku === sku);

      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          state.items = state.items.filter((i) => !(i.itemId === itemId && i.sku === sku));
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

    removeSelectedItems: (state, action: PayloadAction<string[]>) => {
      const idsToRemove = new Set(action.payload);
      state.items = state.items.filter((item) => !idsToRemove.has(item.itemId));
      recalculateTotals(state);
    },

    rollbackQuantity: (
      state,
      action: PayloadAction<{ itemId: string; sku: string | null; previousQuantity: number }>
    ) => {
      const { itemId, sku, previousQuantity } = action.payload;
      const item = state.items.find((item) => item.itemId === itemId && item.sku === sku);
      if (item) {
        item.quantity = previousQuantity;
        recalculateTotals(state);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServerCart.pending, (state) => {
        state.syncStatus = 'syncing';
      })
      .addCase(fetchServerCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.syncStatus = 'idle';
        recalculateTotals(state);
      })
      .addCase(fetchServerCart.rejected, (state) => {
        state.syncStatus = 'error';
      })

      .addCase(mergeCartOnLogin.pending, (state) => {
        state.syncStatus = 'syncing';
      })
      .addCase(mergeCartOnLogin.fulfilled, (state, action) => {
        state.items = action.payload;
        state.syncStatus = 'idle';
        recalculateTotals(state);
      })
      .addCase(mergeCartOnLogin.rejected, (state) => {
        state.syncStatus = 'error';
      })

      .addCase(addToCartServer.pending, (state) => {
        state.syncStatus = 'syncing';
      })
      .addCase(addToCartServer.fulfilled, (state, action) => {
        state.items = action.payload;
        state.syncStatus = 'idle';
        recalculateTotals(state);
      })
      .addCase(addToCartServer.rejected, (state) => {
        state.syncStatus = 'error';
      })

      .addCase(syncItemToServer.pending, (state) => {
        state.syncStatus = 'syncing';
      })
      .addCase(syncItemToServer.fulfilled, (state) => {
        state.syncStatus = 'idle';
      })
      .addCase(syncItemToServer.rejected, (state) => {
        state.syncStatus = 'error';
      })

      .addCase(removeFromCartServer.pending, (state) => {
        state.syncStatus = 'syncing';
      })
      .addCase(removeFromCartServer.fulfilled, (state, action) => {
        state.items = action.payload;
        state.syncStatus = 'idle';
        recalculateTotals(state);
      })
      .addCase(removeFromCartServer.rejected, (state) => {
        state.syncStatus = 'error';
      })

      .addCase(clearCartServer.fulfilled, (state) => {
        state.items = [];
        state.totalQuantity = 0;
        state.totalPrice = 0;
        state.syncStatus = 'idle';
      });
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
  removeSelectedItems,
  rollbackQuantity,
} = cartSlice.actions;

export default cartSlice.reducer;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartTotalQuantity = (state: { cart: CartState }) => state.cart.totalQuantity;
export const selectCartTotalPrice = (state: { cart: CartState }) => state.cart.totalPrice;
export const selectCartItemCount = (state: { cart: CartState }) => state.cart.items.length;
export const selectCartSyncStatus = (state: { cart: CartState }) => state.cart.syncStatus;

export const selectInstockItems = (state: { cart: CartState }) =>
  state.cart.items.filter((item) => item.cartType === 'INSTOCK');
export const selectPartnerItems = (state: { cart: CartState }) =>
  state.cart.items.filter((item) => item.cartType === 'PARTNER');
export const selectInstockTotalPrice = (state: { cart: CartState }) =>
  state.cart.items
    .filter((item) => item.cartType === 'INSTOCK')
    .reduce((sum, item) => sum + (item.unitPrice ?? 0) * item.quantity, 0);
export const selectPartnerTotalPrice = (state: { cart: CartState }) =>
  state.cart.items
    .filter((item) => item.cartType === 'PARTNER')
    .reduce((sum, item) => sum + (item.unitPrice ?? 0) * item.quantity, 0);
