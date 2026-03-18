import apiSlice from '@/lib/api/apiSlice';

export const priceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPriceDetailByVariantId: builder.query<string, string>({
      query: (variantId) => ({
        url: `/instock-price-details/variant/${variantId}`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useLazyGetPriceDetailByVariantIdQuery } = priceApi;
