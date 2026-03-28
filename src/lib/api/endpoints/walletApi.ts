import { apiSlice } from '../apiSlice';
import type { WalletDto, WalletTransactionDto } from '@/types/api/wallet.api.types';

export const walletApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 1. API lấy ví của user hiện tại
    getWallet: builder.query<WalletDto, void>({
      query: () => ({
        url: '/wallet',
        method: 'GET',
      }),
      providesTags: ['Wallet'],
    }),

    // 2. API lấy lịch sử giao dịch (cần truyền walletId)
    getWalletTransactions: builder.query<WalletTransactionDto[], string>({
      query: (walletId) => ({
        url: `/wallet/${walletId}/wallet-transactions`,
        method: 'GET',
      }),
      providesTags: ['Wallet'],
    }),
  }),
});

export const { useGetWalletQuery, useGetWalletTransactionsQuery } = walletApi;
