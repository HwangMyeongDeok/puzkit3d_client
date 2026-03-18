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
