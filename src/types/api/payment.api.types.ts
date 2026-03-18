// src/types/api/payment.api.types.ts

export interface CreateTransactionRequestDto {
  paymentId: string;
  provider?: string | null;
}

export interface GetPaymentByOrderIdResponse {
  paymentId: string;
  orderId: string;
  orderType?: string | null;
  amount: number;
  status?: string | null;
  expiredAt: string;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionDto {
  id: string;
  txnRef?: string | null;
  provider?: string | null;
  status?: string | null;
  amount: number;
  paymentUrl?: string | null;
  expiredAt: string;
  transactionNo?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetPaymentTransactionsResponse {
  transactions?: TransactionDto[] | null;
}

export interface VnPayIPNResponseDto {
  rspCode?: string | null;
  message?: string | null;
}
