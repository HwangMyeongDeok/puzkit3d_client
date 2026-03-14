import type {
  PagedResultDto,
  ProductDto,
  ProductDetailDto,
  GetVariantsResponse,
} from '../product.types';

// ============ Request / Response Types ============

export interface GetProductsRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  isActive?: boolean;
}

export type GetProductsResponse = PagedResultDto<ProductDto>;

export type GetProductBySlugResponse = ProductDetailDto;

/** API trả về { variants: ProductVariantDto[] } */
export type GetProductVariantsResponse = GetVariantsResponse;

// ============ ADMIN Mutation DTOs ============

export interface CreateInstockProductRequestDto {
  name: string;
  totalPieceCount: number;
  difficultLevel: string;
  estimatedBuildTime: number;
  thumbnailUrl: string;
  previewAsset: string[];
  description?: string;
  topicId: string;
  assemblyMethodId: string;
  capabilityId: string;
  materialId: string;
  variants: CreateInstockProductVariantDto[];
}

export interface CreateInstockProductVariantDto {
  color: string;
  assembledLengthMm: number;
  assembledWidthMm: number;
  assembledHeightMm: number;
  unitPrice: number;
  totalQuantity: number;
}

export interface UpdateInstockProductRequestDto {
  name?: string;
  totalPieceCount?: number;
  difficultLevel?: string;
  estimatedBuildTime?: number;
  thumbnailUrl?: string;
  previewAsset?: string[];
  description?: string;
  topicId?: string;
  assemblyMethodId?: string;
  capabilityId?: string;
  materialId?: string;
}

export interface UpdateInstockProductVariantRequestDto {
  color?: string;
  assembledLengthMm?: number;
  assembledWidthMm?: number;
  assembledHeightMm?: number;
}
