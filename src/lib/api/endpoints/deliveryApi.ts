import { apiSlice } from '../apiSlice';
import type {
  GetShippingFeeRequestDto,
  GetShippingFeeResponseDto,
  GetDeliveryTrackingRequestDto,
  GetDeliveryTrackingResponseDto,
} from '@/types/api/delivery.api.types';

export const deliveryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getShippingFee: builder.query<number, GetShippingFeeRequestDto>({
      query: (params) => ({
        url: '/delivery-trackings/shipping-fee',
        method: 'GET',
        params: { ...params },
      }),
      transformResponse: (response: GetShippingFeeResponseDto) => {
        if (typeof response === 'number') return response;
        if ('shippingFee' in response) return response.shippingFee ?? 0;
        if ('amount' in response) return response.amount ?? 0;
        return 0;
      },
      providesTags: ['Delivery'],
    }),

    getDeliveryTracking: builder.query<
      GetDeliveryTrackingResponseDto,
      GetDeliveryTrackingRequestDto
    >({
      query: ({ orderId, pageNumber = 1, pageSize = 10, status }) => ({
        url: `/delivery-trackings/order/${orderId}`,
        method: 'GET',
        params: {
          pageNumber,
          pageSize,
          ...(status && { status }),
        },
      }),
      providesTags: ['DeliveryTracking'],
    }),
  }),
});

export const { useGetShippingFeeQuery, useGetDeliveryTrackingQuery } = deliveryApi;
