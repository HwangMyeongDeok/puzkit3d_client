// src/lib/api/endpoints/paymentApi.ts
import { apiSlice } from '../apiSlice';
import type {
  CreateTransactionRequestDto,
  GetPaymentByOrderIdResponse,
  GetPaymentTransactionsResponse,
} from '@/types/api/payment.api.types';

export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentByOrderId: builder.query<GetPaymentByOrderIdResponse, string>({
      query: (orderId) => ({ url: `/orders/${orderId}/payments` }),
      providesTags: ['Payment'],
    }),

    getPaymentTransactions: builder.query<GetPaymentTransactionsResponse, string>({
      query: (paymentId) => ({ url: `/payments/${paymentId}/transactions` }),
    }),

    createTransaction: builder.mutation<string, CreateTransactionRequestDto>({
      query: ({ paymentId, provider }) => ({
        url: `/payments/${paymentId}/transactions`,
        method: 'POST',
        data: { paymentId, provider },
      }),
      invalidatesTags: ['Payment', 'Order'],
    }),
  }),
});

export const {
  useGetPaymentByOrderIdQuery,
  useLazyGetPaymentByOrderIdQuery,
  useGetPaymentTransactionsQuery,
  useCreateTransactionMutation,
} = paymentApi;
