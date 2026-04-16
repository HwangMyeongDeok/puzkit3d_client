import { apiSlice } from '@/lib/api/apiSlice';

import type {
  GetProductsRequest,
  GetProductsResponse,
  GetProductBySlugResponse,
  GetProductVariantsResponse,
  CreateInstockProductRequestDto,
  UpdateInstockProductRequestDto,
} from '@/types/api/product.api.types';

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ========== NEW QUERY HOOKS (DTO-based) ==========

    // 1. Get paginated product list
    getProducts: builder.query<GetProductsResponse, GetProductsRequest>({
      query: (params) => ({
        url: '/instock-products',
        method: 'GET',
        params: params as Record<string, unknown>,
      }),

      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    // 2. Get product detail by slug
    getProductBySlug: builder.query<GetProductBySlugResponse, string>({
      query: (slug) => ({
        url: `/instock-products/slug/${slug}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, slug) => [{ type: 'Product', id: `slug-${slug}` }],
    }),

    // 3. Get variants for a product — API returns { variants: [...] }
    getProductVariants: builder.query<GetProductVariantsResponse, string>({
      query: (productId) => ({
        url: `/instock-products/${productId}/variants`,
        method: 'GET',
      }),
      providesTags: (_result, _error, productId) => [
        { type: 'Product', id: `variants-${productId}` },
      ],
    }),

    // ========== ADMIN MUTATIONS ==========

    createInstockProduct: builder.mutation<string, CreateInstockProductRequestDto>({
      query: (productData) => ({
        url: '/instock-products',
        method: 'POST',
        data: productData,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    updateInstockProduct: builder.mutation<
      void,
      { id: string; data: UpdateInstockProductRequestDto }
    >({
      query: ({ id, data }) => ({
        url: `/instock-products/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    deleteInstockProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/instock-products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    activateInstockProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/instock-products/${id}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetProductVariantsQuery,
  useCreateInstockProductMutation,
  useUpdateInstockProductMutation,
  useDeleteInstockProductMutation,
  useActivateInstockProductMutation,
} = productApi;
