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
        body: payload,
      }),
      invalidatesTags: ['Product'],
    }),

    getOrderFeedbacks: builder.query<FeedbackDto[], string>({
      query: (orderId) => ({
        url: `/orders/${orderId}/feedback`,
        method: 'GET',
      }),
      providesTags: ['Product'],
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
      providesTags: ['Product'],
    }),
  }),
});

export const { useCreateFeedbackMutation, useGetOrderFeedbacksQuery, useGetProductFeedbacksQuery } =
  feedbackApi;
