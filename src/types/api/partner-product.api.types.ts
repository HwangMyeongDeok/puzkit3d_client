export interface PartnerProductListItemDto {
  id: string;
  partnerId: string;
  name: string;
  referencePrice: number;
  thumbnailUrl: string;
  slug: string;
  description: string | null;
}

export interface GetPartnerProductsResponse {
  items: PartnerProductListItemDto[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
}

export interface PartnerProductDetailDto {
  id: string;
  partnerId: string;
  name: string;
  referencePrice: number;
  thumbnailUrl: string;
  previewAsset?: string[] | Record<string, string> | string | null;
  slug: string;
  description: string | null;
}
