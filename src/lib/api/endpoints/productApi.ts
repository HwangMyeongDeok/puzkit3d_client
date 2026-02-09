import { apiSlice } from '@/lib/api/apiSlice';

import type { Product, Category, GetProductsRequest, GetProductsResponse } from '@/types';

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

    getProduct: builder.query<Product, string>({
      query: (idOrSlug) => ({
        url: `/products/${idOrSlug}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),

    getFeaturedProducts: builder.query<Product[], void>({
      query: () => ({
        url: '/products/featured',
        method: 'GET',
      }),
      providesTags: [{ type: 'Product', id: 'FEATURED' }],
    }),

    getRelatedProducts: builder.query<Product[], string>({
      query: (productId) => ({
        url: `/products/${productId}/related`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Product', id: `RELATED-${id}` }],
    }),

    getCategories: builder.query<Category[], void>({
      query: () => ({
        url: '/categories',
        method: 'GET',
      }),
      providesTags: ['Category'],
    }),

    getCategory: builder.query<Category, string>({
      query: (idOrSlug) => ({
        url: `/categories/${idOrSlug}`,
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
  useGetCategoriesQuery,
  useGetCategoryQuery,
} = productApi;
