import { apiSlice } from '../apiSlice';

export interface PartnerProductListItem {
  id: string;
  partnerId: string;
  name: string;
  referencePrice: number | null;
  thumbnailUrl: string | null;
  previewAssets: string[];
  slug: string;
  description: string | null;
}

export interface PartnerProductDetailDto {
  id: string;
  partnerId: string;
  name: string;
  referencePrice: number | null;
  thumbnailUrl: string | null;
  previewAssets?: string[];
  previewImages?: string[];
  slug: string;
  description: string | null;
}

export interface GetPartnerProductsResponse {
  items: PartnerProductListItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetPartnerProductsParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  partnerId?: string;
  ascending?: boolean;
}

export const partnerProductApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPartnerProducts: builder.query<GetPartnerProductsResponse, GetPartnerProductsParams | void>({
      query: (params) => ({
        url: '/partner-products',
        method: 'GET',
        params: {
          pageNumber: params?.pageNumber ?? 1,
          pageSize: params?.pageSize ?? 100,
          searchTerm: params?.searchTerm || undefined,
          partnerId: params?.partnerId || undefined,
          ascending: params?.ascending ?? true,
        },
      }),
      providesTags: ['Product'],
    }),

    getPartnerProductById: builder.query<PartnerProductDetailDto, string>({
      query: (id) => ({
        url: `/partner-products/${id}`,
        method: 'GET',
      }),
      providesTags: ['Product'],
    }),

    getPartnerProductBySlug: builder.query<PartnerProductDetailDto, string>({
      query: (slug) => ({
        url: `/partner-products/slug/${slug}`,
        method: 'GET',
      }),
      providesTags: ['Product'],
    }),
  }),
});

export const {
  useGetPartnerProductsQuery,
  useGetPartnerProductByIdQuery,
  useGetPartnerProductBySlugQuery,
} = partnerProductApi;