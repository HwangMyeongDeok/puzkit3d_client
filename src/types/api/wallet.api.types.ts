export interface WalletDto {
  id: string;
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export type WalletTransactionType = 'Reward' | 'Spend' | 'Refund' | string;

export interface WalletTransactionDto {
  id: string;
  userId: string;
  amount: number;
  type: WalletTransactionType;
  orderId?: string;
  createdAt: string;
}
