import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { CartType } from '@/types';

interface CheckoutState {
  selectedIds: string[];
  checkoutMode: 'instock' | 'partner';
}

const initialState: CheckoutState = {
  selectedIds: [],
  checkoutMode: 'instock',
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setSelectedItems: (
      state,
      action: PayloadAction<{ ids: string[]; mode: 'instock' | 'partner' }>
    ) => {
      state.selectedIds = action.payload.ids;
      state.checkoutMode = action.payload.mode;
    },
    clearSelection: (state) => {
      state.selectedIds = [];
      state.checkoutMode = 'instock';
    },
  },
});

export const { setSelectedItems, clearSelection } = checkoutSlice.actions;
export default checkoutSlice.reducer;

export const selectSelectedIds = (state: { checkout: CheckoutState }) => state.checkout.selectedIds;
export const selectCheckoutMode = (state: { checkout: CheckoutState }) =>
  state.checkout.checkoutMode;
