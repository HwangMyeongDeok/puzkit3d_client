import { apiSlice } from '../apiSlice';
import type {
  CreateFeedbackRequestDto,
  FeedbackDto,
  GetProductFeedbacksRequestDto,
  GetProductFeedbacksResponseDto,
} from '@/types/api/feedback.api.types';

export const feedbackApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createFeedback: builder.mutation<FeedbackDto, CreateFeedbackRequestDto>({
      query: (payload) => ({
        url: '/feedbacks',
        method: 'POST',
        data: payload,
      }),

      invalidatesTags: (result, error, arg) => [
        { type: 'Feedback', id: 'LIST' },
        ...(arg.orderDetailId ? [{ type: 'Feedback' as const, id: arg.orderDetailId }] : []),
      ],
    }),

    getOrderFeedbacks: builder.query<FeedbackDto[], string>({
      query: (orderId) => ({
        url: `/orders/${orderId}/feedback`,
        method: 'GET',
      }),
      // 👉 Gắn tag Feedback riêng cho cái Order này
      providesTags: (result, error, orderId) => [
        { type: 'Feedback', id: `Order-${orderId}` },
        { type: 'Feedback', id: 'LIST' },
      ],
    }),

    getOrderDetailFeedback: builder.query<FeedbackDto[], string>({
      query: (orderDetailId) => ({
        url: `/order-details/${orderDetailId}/feedback`,
        method: 'GET',
      }),
      providesTags: (result, error, orderDetailId) => [
        { type: 'Feedback', id: `OrderDetail-${orderDetailId}` },
        { type: 'Feedback', id: 'LIST' },
      ],
    }),

    getProductFeedbacks: builder.query<
      GetProductFeedbacksResponseDto,
      GetProductFeedbacksRequestDto
    >({
      query: ({ productId, rating, pageNumber = 1, pageSize = 10 }) => ({
        url: `/products/${productId}/feedbacks`,
        method: 'GET',
        params: {
          pageNumber,
          pageSize,
          ...(rating !== undefined && { rating }),
        },
      }),
      providesTags: (result, error, arg) => [
        { type: 'Feedback', id: `Product-${arg.productId}` },
        { type: 'Feedback', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useCreateFeedbackMutation,
  useGetOrderFeedbacksQuery,
  useGetOrderDetailFeedbackQuery,
  useGetProductFeedbacksQuery,
} = feedbackApi;
