import type { PaginationParams, PaginatedResponse, SortParams } from '../common.types';
import type { InstockProduct, ProductFilters, ProductSortBy, Topic } from '../product.types';

export interface GetProductsRequest extends PaginationParams, SortParams, ProductFilters {
  sortBy?: ProductSortBy;
}

export type GetProductsResponse = PaginatedResponse<InstockProduct>;

export type GetProductResponse = InstockProduct;

export type GetFeaturedProductsResponse = InstockProduct[];

export type GetRelatedProductsResponse = InstockProduct[];

export type GetTopicsResponse = Topic[];

export type GetTopicResponse = Topic;
