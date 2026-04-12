import { apiSlice } from '../apiSlice';

export interface PartnerCartProductDetails {
  productId: string;
  productName: string;
  slug: string | null;
  variantName: string | null;
  sku: string | null;
  color: string | null;
  assembledLengthMm: number | null;
  assembledWidthMm: number | null;
  assembledHeightMm: number | null;
  thumbnailUrl: string | null;
  isActive: boolean;
  partnerId: string;
  referencePrice: number | null;
}

export interface PartnerCartItem {
  id: string;
  itemId: string;
  unitPrice: number | null;
  inStockProductPriceDetailId: string | null;
  quantity: number;
  totalPrice: number | null;
  productDetails: PartnerCartProductDetails;
  isVariantActive: boolean;
  isValidPrice: boolean;
  newUnitPrice: number | null;
  newPriceDetailId: string | null;
  newPriceName: string | null;
  isValidInventory: boolean;
  availableInventory: number | null;
}

export interface PartnerCartResponse {
  id: string;
  userId: string;
  cartType: 'PARTNER';
  totalItem: number;
  items: PartnerCartItem[];
}

export interface AddItemToPartnerCartBody {
  itemId: string;
  quantity: number;
}

export interface UpdatePartnerCartItemBody {
  itemId: string;
  quantity: number;
}

export const partnerCartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPartnerCart: builder.query<PartnerCartResponse, void>({
      query: () => ({
        url: '/partner-carts/items',
        method: 'GET',
      }),
    }),

    addItemToPartnerCart: builder.mutation<void, AddItemToPartnerCartBody>({
      query: (data) => ({
        url: '/partner-carts/items',
        method: 'POST',
        data,
      }),
    }),

    updatePartnerCartItem: builder.mutation<void, UpdatePartnerCartItemBody>({
      query: ({ itemId, quantity }) => ({
        url: `/partner-carts/items/${itemId}`,
        method: 'PUT',
        data: { quantity },
      }),
    }),

    removeItemFromPartnerCart: builder.mutation<void, string>({
      query: (itemId) => ({
        url: `/partner-carts/items/${itemId}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetPartnerCartQuery,
  useAddItemToPartnerCartMutation,
  useUpdatePartnerCartItemMutation,
  useRemoveItemFromPartnerCartMutation,
} = partnerCartApi;