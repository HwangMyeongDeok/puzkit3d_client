import type { PaginationParams, PaginatedResponse, SortParams } from '../common.types';
import type { Product, ProductFilters, ProductSortBy, Category } from '../product.types';

export interface GetProductsRequest extends PaginationParams, SortParams, ProductFilters {
  sortBy?: ProductSortBy;
}

export type GetProductsResponse = PaginatedResponse<Product>;

export type GetProductResponse = Product;

export type GetFeaturedProductsResponse = Product[];

export type GetRelatedProductsResponse = Product[];

export type GetCategoriesResponse = Category[];

export type GetCategoryResponse = Category;
