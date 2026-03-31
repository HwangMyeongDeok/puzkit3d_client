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

        // Map RawCartDto sang CartDto (làm phẳng dữ liệu)
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

              // Check Giá
              isValidPrice: item.isValidPrice ?? true,
              newUnitPrice: item.newUnitPrice,
              newPriceDetailId: item.newPriceDetailId,
              newPriceName: item.newPriceName,

              // MỚI: Check Kho & Biến thể
              isVariantActive: item.isVariantActive ?? true,
              isValidInventory: item.isValidInventory ?? true,
              // Fallback: Nếu null (không track kho) -> gán 9999 để ko bị khóa nút
              availableInventory: item.availableInventory ?? 9999,
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

    // 3. Cập nhật số lượng HOẶC cập nhật giá mới
    // 3. Cập nhật số lượng HOẶC cập nhật giá mới
    updateCartItem: builder.mutation<
      void,
      { itemId: string; quantity: number; inStockProductPriceDetailId?: string }
    >({
      query: ({ itemId, quantity, inStockProductPriceDetailId }) => ({
        url: `/instock-carts/items/${itemId}`,
        method: 'PUT',
        data: { quantity, inStockProductPriceDetailId },
      }),

      // FIX TẠI ĐÂY: Nếu có update giá thì mới bắt RTK Query fetch lại giỏ hàng
      invalidatesTags: (result, error, arg) => (arg.inStockProductPriceDetailId ? ['Cart'] : []),

      async onQueryStarted(
        { itemId, quantity, inStockProductPriceDetailId },
        { dispatch, queryFulfilled }
      ) {
        const patchResult = dispatch(
          cartApi.util.updateQueryData('getCart', undefined, (draft) => {
            if (draft?.items) {
              const item = draft.items.find((i) => i.itemId === itemId);
              if (item) {
                // Xử lý cập nhật số lượng
                const qtyDiff = quantity - item.quantity;
                draft.totalItem += qtyDiff;
                item.quantity = quantity;

                // Optimistic Update cho việc đổi giá (để UI đổi trong 0.1s trước khi fetch lại)
                if (inStockProductPriceDetailId && item.newUnitPrice) {
                  item.unitPrice = item.newUnitPrice;
                  item.isValidPrice = true;
                  item.priceDetailId = inStockProductPriceDetailId;

                  item.newUnitPrice = undefined;
                  item.newPriceDetailId = undefined;
                  item.newPriceName = undefined;
                }

                // Cập nhật lại tổng tiền của item này
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
