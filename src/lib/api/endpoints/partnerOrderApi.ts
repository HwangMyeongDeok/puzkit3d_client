import { apiSlice } from '../apiSlice';
import type {
  CreatePartnerOrderRequestDto,
  PartnerOrderDetailDto,
  PartnerOrdersPagedResult,
} from '@/types/api/partner-order.api.types';

export const partnerOrderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyPartnerOrders: builder.query<
      PartnerOrdersPagedResult,
      { pageNumber: number; pageSize: number; status?: string }
    >({
      query: (params) => ({
        url: '/partner-orders/my-orders',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Order' as const, id })),
              { type: 'Order', id: 'PARTNER_LIST' },
            ]
          : [{ type: 'Order', id: 'PARTNER_LIST' }],
    }),

    getPartnerOrderById: builder.query<PartnerOrderDetailDto, string>({
      query: (id) => ({
        url: `/partner-orders/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),

    createPartnerOrder: builder.mutation<string, CreatePartnerOrderRequestDto>({
      query: (data) => ({
        url: '/partner-orders',
        method: 'POST',
        data,
      }),
      transformResponse: (response: string | { id?: string; orderId?: string }) => {
        if (typeof response === 'string') return response;
        return response.orderId || response.id || '';
      },
      invalidatesTags: ['Order', 'Wallet', 'Payment'],
    }),

    updatePartnerOrderStatus: builder.mutation<unknown, { orderId: string; newStatus: string }>({
      query: ({ orderId, newStatus }) => ({
        url: `/partner-orders/${orderId}/status`,
        method: 'PUT',
        data: { newStatus },
      }),
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: 'Order', id: orderId },
        { type: 'Order', id: 'PARTNER_LIST' },
      ],
    }),
  }),
});

export const {
  useGetMyPartnerOrdersQuery,
  useGetPartnerOrderByIdQuery,
  useCreatePartnerOrderMutation,
  useUpdatePartnerOrderStatusMutation,
} = partnerOrderApi;
