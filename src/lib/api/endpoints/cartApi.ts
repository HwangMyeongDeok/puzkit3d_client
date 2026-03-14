import { apiSlice } from '../apiSlice';
import type { CartDto, AddItemToInStockCartRequest } from '@/types/api/cart.api.types';

export const cartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Lấy giỏ hàng
    getCart: builder.query<CartDto, void>({
      queryFn: async (_arg, _queryApi, _extraOptions, fetchWithBQ) => {
        const result = await fetchWithBQ({
          url: '/instock-carts/items',
          method: 'GET',
        });

        // Xử lý 404 cho Axios Base Query
        if (result.error && (result.error as any).status === 404) {
          return {
            data: {
              id: '',
              userId: '',
              cartType: 'INSTOCK_CART',
              items: [],
              totalItem: 0,
            } as CartDto,
          };
        }

        if (result.error) return { error: result.error };
        return { data: result.data as CartDto };
      },
      providesTags: ['Cart'],
    }),

    // 2. Thêm vào giỏ
    addToCart: builder.mutation<void, AddItemToInStockCartRequest>({
      query: (body) => ({
        url: '/instock-carts/items',
        method: 'POST',
        data: body, // Giữ 'data' cho Axios
      }),
      invalidatesTags: ['Cart'],
    }),

    // 3. Cập nhật số lượng (Optimistic Update)
    updateCartItem: builder.mutation<void, { itemId: string; quantity: number }>({
      query: ({ itemId, quantity }) => ({
        url: `/instock-carts/items/${itemId}`,
        method: 'PUT',
        data: { quantity }, // Giữ 'data' cho Axios
      }),
      async onQueryStarted({ itemId, quantity }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cartApi.util.updateQueryData('getCart', undefined, (draft) => {
            if (draft?.items) {
              const item = draft.items.find((i) => i.itemId === itemId);
              if (item) {
                item.quantity = quantity;
                // Tính lại giá tạm thời để UI khớp con số ngay lập tức
                if (item.unitPrice) {
                  item.totalPrice = item.unitPrice * quantity;
                }
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

    // 4. Xóa khỏi giỏ (Optimistic Update)
    removeCartItem: builder.mutation<void, string>({
      query: (itemId) => ({
        url: `/instock-carts/items/${itemId}`,
        method: 'DELETE',
      }),
      async onQueryStarted(itemId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cartApi.util.updateQueryData('getCart', undefined, (draft) => {
            if (draft?.items) {
              draft.items = draft.items.filter((i) => i.itemId !== itemId);
              draft.totalItem = draft.items.length;
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
