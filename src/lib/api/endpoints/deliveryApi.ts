import { apiSlice } from '../apiSlice';
import type {
  GetShippingFeeRequestDto,
  GetShippingFeeResponseDto,
  GetDeliveryTrackingRequestDto,
  GetDeliveryTrackingResponseDto,
} from '@/types/api/delivery.api.types';

export interface UpdateHandoverImageRequestDto {
  trackingId: string;
  handOverImageUrl: string;
}

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

    updateDeliveryHandover: builder.mutation<void, UpdateHandoverImageRequestDto>({
      query: ({ trackingId, handOverImageUrl }) => ({
        url: `/delivery-trackings/${trackingId}/hand-over-image`,
        method: 'PUT',
        data: {
          imageUrl: handOverImageUrl,
        },
      }),
      invalidatesTags: ['DeliveryTracking'],
    }),

    getWaybillNumber: builder.query<string, string>({
      query: (deliveryTrackingId) => ({
        url: `/delivery-trackings/${deliveryTrackingId}/waybill-number`,
        method: 'GET',
        // Backend trả về chuỗi text thuần, cần báo cho RTK Query biết
        responseHandler: (response: Response) => response.text(),
      }),
      providesTags: (result, error, id) => [{ type: 'DeliveryTracking', id }],
    }),
  }),
});

export const {
  useGetShippingFeeQuery,
  useGetDeliveryTrackingQuery,
  useUpdateDeliveryHandoverMutation,
  useGetWaybillNumberQuery,
} = deliveryApi;
