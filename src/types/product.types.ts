import type { BaseEntity } from './common.types';

// ============ CATALOG TYPES ============

export interface Topic extends BaseEntity {
  name: string;
  description: string | null;
  slug: string;
  parentId: string | null;
  isActive: boolean;
}

export interface AssemblyMethod extends BaseEntity {
  name: string;
  description: string | null;
  slug: string;
  isActive: boolean;
}

export interface Material extends BaseEntity {
  name: string;
  description: string | null;
  slug: string;
  isActive: boolean;
}

export interface Capability extends BaseEntity {
  name: string;
  description: string | null;
  slug: string;
  isActive: boolean;
}

// ============ INSTOCK TYPES ============

export type DifficultLevel = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

export interface InstockProductVariant extends BaseEntity {
  instockProductId: string;
  sku: string;
  color: string;
  assembledLengthMm: number;
  assembledWidthMm: number;
  assembledHeightMm: number;
  isActive: boolean;
}

export interface InstockProductPriceDetail extends BaseEntity {
  instockPriceId: string;
  instockProductVariantId: string;
  unitPrice: number;
  isActive: boolean;
}

export interface InstockPrice extends BaseEntity {
  name: string;
  effectiveFrom: string;
  effectiveTo: string;
  priority: number;
  isActive: boolean;
}

export interface InstockInventory extends BaseEntity {
  instockProductVariantId: string;
  totalQuantity: number;
}

export interface InstockProduct extends BaseEntity {
  code: string;
  slug: string;
  name: string;
  totalPieceCount: number;
  difficultLevel: DifficultLevel;
  estimatedBuildTime: number;
  thumbnailUrl: string;
  previewAsset: string[];
  description: string | null;
  topicId: string;
  assemblyMethodId: string;
  capabilityId: string;
  materialId: string;
  isActive: boolean;

  // Nested / joined data from API
  topic: Topic;
  assemblyMethod: AssemblyMethod;
  material: Material;
  capability: Capability;
  variants: InstockProductVariantWithDetails[];

  // Aggregated / computed (not in DB directly)
  rating: number;
  soldCount: number;
}

export interface InstockProductVariantWithDetails extends InstockProductVariant {
  priceDetail: InstockProductPriceDetail;
  inventory: InstockInventory;
}

// ============ PARTNER TYPES ============

export interface ImportServiceConfig extends BaseEntity {
  code: string;
  baseShippingFee: number;
  countryCode: string;
  countryName: string;
  importTaxPercentage: number;
  isActive: boolean;
}

export interface Partner extends BaseEntity {
  name: string;
  description: string | null;
  contactEmail: string;
  contactPhone: string;
  address: string;
  slug: string;
  importServiceConfigId: string;
  isActive: boolean;

  importServiceConfig?: ImportServiceConfig;
}

export interface PartnerProduct extends BaseEntity {
  partnerId: string;
  name: string;
  referencePrice: number;
  description: string | null;
  thumbnailUrl: string;
  previewAsset: string[];
  slug: string;
  isActive: boolean;

  // Nested
  partner: Partner;

  // Aggregated / computed
  rating: number;
}

// ============ FILTER & SORT ============

export interface ProductFilters {
  search?: string;
  topicId?: string;
  materialId?: string;
  difficultLevel?: DifficultLevel;
  minPrice?: number;
  maxPrice?: number;
}

export interface PartnerProductFilters {
  search?: string;
  partnerId?: string;
  minPrice?: number;
  maxPrice?: number;
}

export type ProductSortBy = 'name' | 'price' | 'createdAt' | 'rating';
