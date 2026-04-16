export interface OrderConfigDto {
  id: string;
  orderMustCompleteInDays: number;
  updatedAt: string;
}

export interface PaymentConfigDto {
  id: string;
  onlinePaymentExpiredValue: number;
  onlinePaymentExpiredUnit: string;
  onlineTransactionExpiredValue: number;
  onlineTransactionExpiredUnit: string;
  updatedAt: string;
}

export interface WalletConfigDto {
  id: string;
  onlineOrderReturnPercentage: number;
  onlineOrderCompletedRewardPercentage: number;
  codOrderCompletedRewardPercentage: number;
  updatedAt: string;
}
