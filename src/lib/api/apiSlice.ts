import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from './axiosBaseQuery';

export const tagTypes = [
  'Product',
  'Category',
  'Order',
  'Cart',
  'User',
  'Address',
  'ImportRequest',
  'CustomOrder',
  'Notification',
  'Delivery',
  'Payment',
  'SupportTicket',
  'DeliveryTracking',
  'Wallet',
] as const;

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: tagTypes,
  endpoints: () => ({}),
  keepUnusedDataFor: 60,
  refetchOnFocus: true,
  refetchOnReconnect: true,
});

export default apiSlice;
