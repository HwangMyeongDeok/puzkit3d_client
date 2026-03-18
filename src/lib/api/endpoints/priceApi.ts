import apiSlice from '@/lib/api/apiSlice';
import type { InstockPriceDetailDto } from '@/types/api';

export const priceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPriceDetailByVariantId: builder.query<InstockPriceDetailDto, string>({
      query: (variantId) => ({
        url: `/instock-price-details/variant/${variantId}`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetPriceDetailByVariantIdQuery } = priceApi;
