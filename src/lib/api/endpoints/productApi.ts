import { apiSlice } from '@/lib/api/apiSlice';

import type { InstockProduct, Topic, GetProductsRequest, GetProductsResponse } from '@/types';

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<GetProductsResponse, GetProductsRequest>({
      query: (params) => ({
        url: '/products',
        method: 'GET',
        params: params as Record<string, unknown>,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    getProduct: builder.query<InstockProduct, string>({
      query: (idOrSlug) => ({
        url: `/products/${idOrSlug}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),

    getFeaturedProducts: builder.query<InstockProduct[], void>({
      query: () => ({
        url: '/products/featured',
        method: 'GET',
      }),
      providesTags: [{ type: 'Product', id: 'FEATURED' }],
    }),

    getRelatedProducts: builder.query<InstockProduct[], string>({
      query: (productId) => ({
        url: `/products/${productId}/related`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Product', id: `RELATED-${id}` }],
    }),

    getTopics: builder.query<Topic[], void>({
      query: () => ({
        url: '/topics',
        method: 'GET',
      }),
      providesTags: ['Category'],
    }),

    getTopic: builder.query<Topic, string>({
      query: (idOrSlug) => ({
        url: `/topics/${idOrSlug}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Category', id }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetFeaturedProductsQuery,
  useGetRelatedProductsQuery,
  useGetTopicsQuery,
  useGetTopicQuery,
} = productApi;
