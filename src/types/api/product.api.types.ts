export interface PagedResultDto<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProductDto {
  id: string;
  code: string;
  slug: string;
  name: string;
  description: string;
  difficultLevel: string;
  estimatedBuildTime: number;
  thumbnailUrl: string;
  totalPieceCount: number;
  topicId: string;
  materialId: string;
  assemblyMethodId: string;
  capabilityIds: string[];
}

export interface ProductDetailDto extends ProductDto {
  previewAsset: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariantDto {
  id: string;
  sku: string;
  color: string;
  assembledLengthMm: number;
  assembledWidthMm: number;
  assembledHeightMm: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** API trả về object chứa mảng variants */
export interface GetVariantsResponse {
  variants: ProductVariantDto[];
}

// ============ Request / Response Types ============

export interface GetProductsRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  difficultyLevel?: string;
  materialSlug?: string;
  topicSlug?: string;
  assemblyMethodSlug?: string;
  capabilitySlug?: string;
  isActive?: boolean;
}

export type GetProductsResponse = PagedResultDto<ProductDto>;

export type GetProductBySlugResponse = ProductDetailDto;

export type GetProductVariantsResponse = GetVariantsResponse;

// ============ ADMIN Mutation DTOs ============

export interface CreateInstockProductVariantDto {
  color: string;
  assembledLengthMm: number;
  assembledWidthMm: number;
  assembledHeightMm: number;
  unitPrice: number;
  totalQuantity: number;
}

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
  materialId: string;
  capabilityIds: string[]; // Đã sửa thành mảng (chữ s)
  variants: CreateInstockProductVariantDto[];
}

export interface UpdateInstockProductVariantRequestDto {
  color?: string;
  assembledLengthMm?: number;
  assembledWidthMm?: number;
  assembledHeightMm?: number;
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
  materialId?: string;
  capabilityIds?: string[]; // Đã sửa thành mảng (chữ s)
}
