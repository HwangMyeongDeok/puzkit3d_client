export interface GetShippingFeeRequestDto {
  provinceName: string;
  districtName: string;
  wardName: string;
}

export interface ShippingFeeObjectResponse {
  shippingFee: number;
}

export interface ShippingFeeAmountResponse {
  amount: number;
}

export type GetShippingFeeResponseDto =
  | number
  | ShippingFeeObjectResponse
  | ShippingFeeAmountResponse;

export interface DeliveryTrackingDetail {
  id: string;
  type: string;
  itemId: string;
  quantity: number;
}

export interface DeliveryTracking {
  id: string;
  orderId: string;
  supportTicketId: string;
  deliveryOrderCode: string;
  status: string;
  type: string;
  note: string;
  handOverImageUrl: string;
  expectedDeliveryDate: string;
  deliveredAt: string;
  createdAt: string;
  updatedAt: string;
  details: DeliveryTrackingDetail[];
}

export interface GetDeliveryTrackingResponseDto {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  data: DeliveryTracking[];
}

export interface GetDeliveryTrackingRequestDto {
  orderId: string;
  pageNumber?: number;
  pageSize?: number;
  status?: string;
}
