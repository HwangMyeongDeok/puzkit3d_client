import { apiSlice } from '../apiSlice';
import { normalizeAssetList, normalizeAssetUrl } from '@/lib/media';

export interface PartnerProductListItemDto {
  id: string;
  partnerId: string;
  name: string;
  referencePrice: number;
  quantity: number;
  thumbnailUrl: string;
  previewAssets?: string[] | Record<string, string> | null;
  slug: string;
  description: string | null;
  isActive?: boolean;
}

export interface GetPartnerProductsResponseDto {
  items: PartnerProductListItemDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PartnerProductDetailDto {
  id: string;
  partnerId: string;
  name: string;
  referencePrice: number;
  quantity: number;
  thumbnailUrl: string;
  previewAssets?: string[] | Record<string, string> | null;
  slug: string;
  description: string | null;
  isActive?: boolean;
}

export interface PartnerProductListItem {
  id: string;
  partnerId: string;
  name: string;
  partnerName?: string;
  referencePrice: number;
  quantity: number;
  thumbnailUrl: string;
  previewImages: string[];
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

export interface PartnerProductDetail {
  id: string;
  partnerId: string;
  name: string;
  partnerName?: string;
  referencePrice: number;
  quantity: number;
  thumbnailUrl: string;
  previewImages: string[];
  slug: string;
  description: string | null;
}

export interface GetPartnerProductsRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  partnerId?: string;
}

function parsePreviewAssets(previewAssets?: string[] | Record<string, string> | null): string[] {
  if (!previewAssets) return [];

  if (Array.isArray(previewAssets)) {
    return normalizeAssetList(previewAssets);
  }

  return normalizeAssetList(Object.values(previewAssets));
}

function transformPartnerProductListItem(dto: PartnerProductListItemDto): PartnerProductListItem {
  return {
    id: dto.id,
    partnerId: dto.partnerId,
    name: dto.name,
    referencePrice: dto.referencePrice,
    quantity: dto.quantity,
    thumbnailUrl: normalizeAssetUrl(dto.thumbnailUrl),
    previewImages: parsePreviewAssets(dto.previewAssets),
    slug: dto.slug,
    description: dto.description ?? null,
  };
}

function transformPartnerProductDetail(dto: PartnerProductDetailDto): PartnerProductDetail {
  const thumbnailUrl = normalizeAssetUrl(dto.thumbnailUrl);
  const previews = parsePreviewAssets(dto.previewAssets);

  return {
    id: dto.id,
    partnerId: dto.partnerId,
    name: dto.name,
    referencePrice: dto.referencePrice,
    quantity: dto.quantity,
    thumbnailUrl,
    previewImages: [thumbnailUrl, ...previews.filter((img) => img !== thumbnailUrl)],
    slug: dto.slug,
    description: dto.description ?? null,
  };
}

export const partnerProductApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPartnerProducts: builder.query<GetPartnerProductsResponse, GetPartnerProductsRequest | void>(
      {
        query: (params) => ({
          url: '/partner-products',
          method: 'GET',
          params: {
            pageNumber: params?.pageNumber ?? 1,
            pageSize: params?.pageSize ?? 100,
            searchTerm: params?.searchTerm || undefined,
            partnerId: params?.partnerId || undefined,
          },
        }),
        transformResponse: (
          response: GetPartnerProductsResponseDto
        ): GetPartnerProductsResponse => ({
          ...response,
          items: (response.items || []).map(transformPartnerProductListItem),
        }),
        providesTags: ['Product'],
      }
    ),

    getPartnerProductById: builder.query<PartnerProductDetail, string>({
      query: (id) => ({
        url: `/partner-products/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: PartnerProductDetailDto) =>
        transformPartnerProductDetail(response),
      providesTags: ['Product'],
    }),

    getPartnerProductBySlug: builder.query<PartnerProductDetail, string>({
      query: (slug) => ({
        url: `/partner-products/slug/${slug}`,
        method: 'GET',
      }),
      transformResponse: (response: PartnerProductDetailDto) =>
        transformPartnerProductDetail(response),
      providesTags: ['Product'],
    }),
  }),
});

export const {
  useGetPartnerProductsQuery,
  useGetPartnerProductByIdQuery,
  useGetPartnerProductBySlugQuery,
} = partnerProductApi;
