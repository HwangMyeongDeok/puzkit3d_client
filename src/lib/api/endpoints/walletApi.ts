// src/lib/api/endpoints/walletApi.ts
import { apiSlice } from '../apiSlice';
import type { WalletDto, WalletTransactionsResponseDto } from '@/types/api/wallet.api.types';

export const walletApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWallet: builder.query<WalletDto, void>({
      query: () => ({
        url: '/api/wallet',
        method: 'GET',
      }),
      providesTags: ['Wallet'],
    }),

    getWalletTransactions: builder.query<
      WalletTransactionsResponseDto,
      { walletId: string; pageNumber?: number; pageSize?: number } | { walletId: string }
    >({
      query: (params) => ({
        url: `/api/wallet/${params.walletId}/wallet-transactions`,
        method: 'GET',
        params: {
          pageNumber: (params as any).pageNumber || 1,
          pageSize: (params as any).pageSize || 10,
        },
      }),
      providesTags: (_result, _error, { walletId }) => [{ type: 'Wallet', id: walletId }],
    }),
  }),
});

export const { useGetWalletQuery, useGetWalletTransactionsQuery } = walletApi;
