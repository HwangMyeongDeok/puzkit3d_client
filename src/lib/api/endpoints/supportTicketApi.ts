import { apiSlice } from '../apiSlice';

export type TicketType = 'ReplacePart' | 'Exchange' | 'Return';

export type TicketStatus = 'Open' | 'Processing' | 'Resolved' | 'Rejected';

export interface ProductPartDto {
  id: string;
  name: string;
  partType: string;
  code: string;
  totalPieces: number;
}

export interface CreateTicketDetailDto {
  orderDetailId: string;
  partId?: string;
  quantity: number;
  note?: string;
}

export interface CreateTicketRequestDto {
  orderId: string;
  type: TicketType;
  reason: string;
  proof: string;
  details: CreateTicketDetailDto[];
}

export interface TicketDetailDto {
  id: string;
  orderDetailId: string;
  partId: string | null;
  quantity: number;
  note: string | null;
}

export interface SupportTicketDto {
  id: string;
  code: string;
  userId: string;
  orderId: string;
  orderCode?: string;
  type: TicketType;
  status: TicketStatus;
  reason: string;
  proof: string;
  createdAt: string;
  updatedAt: string;
  details: TicketDetailDto[];
}

export interface SupportTicketPagedResult {
  items: SupportTicketDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export type GetTicketsParams = {
  pageNumber: number;
  pageSize: number;
  status?: TicketStatus | string;
};

export interface UpdateTicketStatusRequest {
  status: TicketStatus | string;
}

export const supportTicketApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* GET /api/instock-products/{productId}/parts */
    getProductParts: builder.query<ProductPartDto[], string>({
      query: (productId) => ({
        url: `/instock-products/${productId}/parts`,
        method: 'GET',
      }),
      // Read-only catalogue data — no invalidation tags required
    }),

    /* GET /api/support-tickets — paginated list with optional status filter */
    getTickets: builder.query<SupportTicketPagedResult, GetTicketsParams>({
      query: (params) => ({
        url: '/support-tickets',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'SupportTicket' as const, id })),
              { type: 'SupportTicket', id: 'LIST' },
            ]
          : [{ type: 'SupportTicket', id: 'LIST' }],
    }),

    /* GET /api/support-tickets/:id */
    getTicketById: builder.query<SupportTicketDto, string>({
      query: (id) => ({ url: `/support-tickets/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'SupportTicket', id }],
    }),

    getTicketByOrderId: builder.query<SupportTicketDto, string>({
      query: (orderId) => ({
        url: `/support-tickets/order/${orderId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, orderId) => [
        { type: 'SupportTicket', id: `ORDER-${orderId}` },
      ],
    }),

    /* POST /api/support-tickets */
    createTicket: builder.mutation<SupportTicketDto, CreateTicketRequestDto>({
      query: (data) => ({
        url: '/support-tickets',
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: 'SupportTicket', id: 'LIST' }],
    }),

    /* PATCH /api/support-tickets/:id/status — customers can ONLY set 'Resolved' */
    updateTicketStatus: builder.mutation<void, { id: string; status: 'Resolved' }>({
      query: ({ id, status }) => ({
        url: `/support-tickets/${id}/status`,
        method: 'PATCH',
        data: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'SupportTicket', id },
        { type: 'SupportTicket', id: 'LIST' },
      ],
    }),

    /* DELETE /api/support-tickets/:id — only works when status is 'Open' */
    deleteTicket: builder.mutation<void, string>({
      query: (id) => ({
        url: `/support-tickets/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'SupportTicket', id },
        { type: 'SupportTicket', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetProductPartsQuery,
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useGetTicketByOrderIdQuery,
  useCreateTicketMutation,
  useUpdateTicketStatusMutation,
  useDeleteTicketMutation,
} = supportTicketApi;
