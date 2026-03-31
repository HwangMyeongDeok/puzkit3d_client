export interface OrderConfigDto {
  id: string;
  orderMustCompleteInDays: number;
  updatedAt: string;
}

export interface PaymentConfigDto {
  id: string;
  onlinePaymentExpiredInDays: number;
  onlineTransactionExpiredInMinutes: number;
  updatedAt: string;
}

export interface WalletConfigDto {
  id: string;
  onlineOrderReturnPercentage: number;
  onlineOrderCompletedRewardPercentage: number;
  codOrderCompletedRewardPercentage: number;
  updatedAt: string;
}
