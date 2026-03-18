import { apiSlice } from '../apiSlice';
import type {
  GetShippingFeeRequestDto,
  GetShippingFeeResponseDto,
} from '@/types/api/delivery.api.types';

export const deliveryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getShippingFee: builder.query<number, GetShippingFeeRequestDto>({
      query: (params) => ({
        url: '/delivery/shipping-fee',
        method: 'GET',
        params,
      }),
      transformResponse: (response: GetShippingFeeResponseDto) => {
        if (typeof response === 'number') return response;
        if ('shippingFee' in response) return response.shippingFee ?? 0;
        if ('amount' in response) return response.amount ?? 0;
        return 0;
      },
      providesTags: ['Delivery'],
    }),
  }),
});

export const { useGetShippingFeeQuery } = deliveryApi;
