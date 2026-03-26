import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { apiSlice } from '../apiSlice';
import type {
  CartDto,
  RawCartDto,
  CartItemDto,
  AddItemToInStockCartRequest,
} from '@/types/api/cart.api.types';

export const cartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Lấy giỏ hàng
    getCart: builder.query<CartDto, void>({
      queryFn: async (_arg, _queryApi, _extraOptions, fetchWithBQ) => {
        const result = await fetchWithBQ({
          url: '/instock-carts/items',
          method: 'GET',
        });

        if (result.error) {
          const error = result.error as FetchBaseQueryError;
          if (error.status === 404) {
            return {
              data: { id: '', totalItem: 0, items: [] } as CartDto,
            };
          }
          return { error: result.error };
        }

        const rawData = result.data as RawCartDto;

        // Bỏ hết ?. và || đi vì ProductDetails chắc chắn có từ BE
        const cleanData: CartDto = {
          id: rawData.id || '',
          totalItem: rawData.totalItem || 0,
          items: (rawData.items || []).map(
            (item): CartItemDto => ({
              id: item.id,
              itemId: item.itemId,
              productId: item.productDetails.productId,
              priceDetailId: item.inStockProductPriceDetailId,

              name: item.productDetails.productName,
              variantName: item.productDetails.variantName,
              slug: item.productDetails.slug,
              sku: item.productDetails.sku,
              color: item.productDetails.color,
              thumbnailUrl: item.productDetails.thumbnailUrl,

              unitPrice: item.unitPrice,
              quantity: item.quantity,
              totalPrice: item.totalPrice,
            })
          ),
        };

        return { data: cleanData };
      },
      providesTags: ['Cart'],
    }),

    // 2. Thêm vào giỏ
    addToCart: builder.mutation<void, AddItemToInStockCartRequest>({
      query: (body) => ({
        url: '/instock-carts/items',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Cart'],
    }),

    // 3. Cập nhật số lượng
    updateCartItem: builder.mutation<void, { itemId: string; quantity: number }>({
      query: ({ itemId, quantity }) => ({
        url: `/instock-carts/items/${itemId}`,
        method: 'PUT',
        data: { quantity },
      }),
      async onQueryStarted({ itemId, quantity }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cartApi.util.updateQueryData('getCart', undefined, (draft) => {
            if (draft?.items) {
              const item = draft.items.find((i) => i.itemId === itemId);
              if (item) {
                // FIX LOGIC: Cộng/trừ chênh lệch vào tổng số lượng giỏ hàng
                const qtyDiff = quantity - item.quantity;
                draft.totalItem += qtyDiff;

                item.quantity = quantity;
                item.totalPrice = item.unitPrice * quantity;
              }
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // 4. Xóa khỏi giỏ
    removeCartItem: builder.mutation<void, string>({
      query: (itemId) => ({
        url: `/instock-carts/items/${itemId}`,
        method: 'DELETE',
      }),
      async onQueryStarted(itemId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cartApi.util.updateQueryData('getCart', undefined, (draft) => {
            if (draft?.items) {
              const itemToRemove = draft.items.find((i) => i.itemId === itemId);
              if (itemToRemove) {
                // FIX LOGIC: Trừ đi số lượng của cái item vừa bị xóa khỏi tổng
                draft.totalItem -= itemToRemove.quantity;

                draft.items = draft.items.filter((i) => i.itemId !== itemId);
              }
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
} = cartApi;
