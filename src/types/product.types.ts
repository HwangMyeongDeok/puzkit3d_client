import type { BaseEntity } from './common.types';

export type Material = 'paper' | 'plastic' | 'wood' | 'metal' | 'screw';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  productCount?: number;
}

export interface ProductDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface Product extends BaseEntity {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: Pick<Category, 'id' | 'name' | 'slug'>;
  material: Material;
  difficulty: Difficulty;
  partCount: number;
  estimatedBuildTime: number;
  dimensions?: ProductDimensions;
  weight?: number;
  requiredTools?: string[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  material?: Material;
  difficulty?: Difficulty;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
}

export type ProductSortBy = 'name' | 'price' | 'createdAt' | 'rating';
