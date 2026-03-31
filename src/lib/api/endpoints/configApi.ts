import apiSlice from '@/lib/api/apiSlice';
import type {
  OrderConfigDto,
  PaymentConfigDto,
  WalletConfigDto,
} from '@/types/api/config.api.types';

export const configApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrderConfig: builder.query<OrderConfigDto, void>({
      query: () => ({
        url: '/configs/order',
        method: 'GET',
      }),
    }),
    getPaymentConfig: builder.query<PaymentConfigDto, void>({
      query: () => ({
        url: '/configs/payment',
        method: 'GET',
      }),
    }),
    getWalletConfig: builder.query<WalletConfigDto, void>({
      query: () => ({
        url: '/configs/wallet',
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetOrderConfigQuery, useGetPaymentConfigQuery, useGetWalletConfigQuery } =
  configApi;
