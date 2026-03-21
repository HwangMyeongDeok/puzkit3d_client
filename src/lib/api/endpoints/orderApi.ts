// src/lib/api/endpoints/orderApi.ts
import { apiSlice } from '../apiSlice';
import type {
  CreateInstockOrderRequestDto,
  GetCustomerOrderByIdResponseDto,
  GetCustomerOrdersResponseDtoPagedResult,
} from '@/types/api/order.api.types';

export const orderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomerOrders: builder.query<
      GetCustomerOrdersResponseDtoPagedResult,
      { pageNumber: number; pageSize: number; status?: string }
    >({
      query: (params) => ({
        url: '/instock-orders/customer',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Order' as const, id })),
              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }],
    }),

    getCustomerOrderById: builder.query<GetCustomerOrderByIdResponseDto, string>({
      query: (orderId) => ({ url: `/instock-orders/${orderId}` }),
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),

    createInstockOrder: builder.mutation<string, CreateInstockOrderRequestDto>({
      query: (data) => ({
        url: '/instock-orders',
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }, 'Cart', 'Payment'],
    }),
  }),
});

export const {
  useGetCustomerOrdersQuery,
  useGetCustomerOrderByIdQuery,
  useCreateInstockOrderMutation,
} = orderApi;
