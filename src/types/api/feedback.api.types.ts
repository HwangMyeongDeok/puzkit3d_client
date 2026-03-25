export interface CreateFeedbackRequestDto {
  orderId: string;
  orderDetailId: string;
  rating: number;
  comment: string;
}

export interface FeedbackDto {
  id: string;
  userId: string;
  orderDetailId?: string; // Add orderDetailId to identify which product was reviewed
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export type GetOrderFeedbackResponseDto = FeedbackDto[];

export interface GetProductFeedbacksResponseDto {
  items: FeedbackDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetProductFeedbacksRequestDto {
  productId: string;
  rating?: number;
  pageNumber?: number;
  pageSize?: number;
}
