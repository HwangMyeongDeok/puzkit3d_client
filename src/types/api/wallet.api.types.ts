// src/types/api/wallet.api.types.ts

export interface WalletDto {
  id: string;
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransactionDto {
  id: string;
  userId: string;
  amount: number;
  type: number; // 0 = deduction, 1 = addition
  orderId: string;
  createdAt: string;
}

export interface WalletTransactionsResponseDto {
  items: WalletTransactionDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}
