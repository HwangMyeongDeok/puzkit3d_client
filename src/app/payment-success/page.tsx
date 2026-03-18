'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  Home,
  Receipt,
  Calendar,
  CreditCard,
  Hash,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';

// Hàm helper để parse ngày giờ của VNPAY (format: yyyyMMddHHmmss)
const formatVnpayDate = (dateString: string | null) => {
  if (!dateString || dateString.length !== 14) return 'Không xác định';
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);
  const hour = dateString.substring(8, 10);
  const minute = dateString.substring(10, 12);
  const second = dateString.substring(12, 14);
  return `${hour}:${minute}:${second} - ${day}/${month}/${year}`;
};

function PaymentSuccessContent() {
  const searchParams = useSearchParams();

  // Lấy các tham số cần thiết từ VNPAY
  const responseCode = searchParams.get('vnp_ResponseCode');
  const amountParam = searchParams.get('vnp_Amount');
  const orderId = searchParams.get('vnp_TxnRef');
  const payDate = searchParams.get('vnp_PayDate');
  const bankCode = searchParams.get('vnp_BankCode');
  const transactionNo = searchParams.get('vnp_TransactionNo');

  const isSuccess = responseCode === '00' || responseCode === null;
  const amount = amountParam ? parseInt(amountParam, 10) / 100 : null;

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-slate-50/50 p-4 py-12">
      {/* Khối Card Hóa Đơn với hiệu ứng Fade In & Slide Up */}
      <div className="animate-in fade-in slide-in-from-bottom-8 w-full max-w-lg duration-500">
        {/* HEADER CỦA HÓA ĐƠN */}
        <div className="relative overflow-hidden rounded-t-2xl bg-white p-8 pb-6 text-center shadow-lg">
          <div
            className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full shadow-sm ${
              isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="animate-in zoom-in h-10 w-10 delay-150 duration-500" />
            ) : (
              <XCircle className="animate-in zoom-in h-10 w-10 delay-150 duration-500" />
            )}
          </div>

          <h1
            className={`mb-2 text-2xl font-bold ${isSuccess ? 'text-slate-800' : 'text-red-600'}`}
          >
            {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          </h1>
          <p className="text-sm text-slate-500">
            {isSuccess
              ? 'Cảm ơn bạn đã mua sắm tại Puzkit3D.'
              : 'Giao dịch bị hủy hoặc có lỗi xảy ra. Vui lòng thử lại.'}
          </p>
        </div>

        {/* ĐƯỜNG CẮT NÉT ĐỨT (Hiệu ứng xé bill) */}
        <div className="relative flex items-center bg-white shadow-lg">
          <div className="absolute -left-3 h-6 w-6 rounded-full bg-slate-50/50 shadow-inner"></div>
          <div className="h-px w-full border-b-2 border-dashed border-slate-200"></div>
          <div className="absolute -right-3 h-6 w-6 rounded-full bg-slate-50/50 shadow-inner"></div>
        </div>

        {/* THÂN HÓA ĐƠN (Thông tin chi tiết) */}
        <div className="rounded-b-2xl bg-white p-8 pt-6 shadow-lg">
          {amount && (
            <div className="mb-6 flex flex-col items-center justify-center rounded-xl bg-slate-50 py-4">
              <span className="text-sm font-medium text-slate-500">Số tiền thanh toán</span>
              <span className="text-3xl font-bold text-slate-800">
                {amount.toLocaleString('vi-VN')} <span className="text-xl underline">đ</span>
              </span>
            </div>
          )}

          <div className="space-y-4 text-sm">
            {orderId && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-slate-500">
                  <Hash className="mr-2 h-4 w-4" /> Mã đơn hàng
                </div>
                <span className="font-semibold text-slate-800">{orderId}</span>
              </div>
            )}

            {bankCode && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-slate-500">
                  <CreditCard className="mr-2 h-4 w-4" /> Ngân hàng
                </div>
                <span className="font-semibold text-slate-800">{bankCode}</span>
              </div>
            )}

            {transactionNo && transactionNo !== '0' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-slate-500">
                  <Receipt className="mr-2 h-4 w-4" /> Mã giao dịch VNPAY
                </div>
                <span className="font-semibold text-slate-800">{transactionNo}</span>
              </div>
            )}

            {payDate && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-slate-500">
                  <Calendar className="mr-2 h-4 w-4" /> Thời gian
                </div>
                <span className="font-semibold text-slate-800">{formatVnpayDate(payDate)}</span>
              </div>
            )}
          </div>

          {/* NÚT ĐIỀU HƯỚNG */}
          <div className="mt-8 flex flex-col gap-3">
            {isSuccess ? (
              <>
                <Button asChild className="h-12 w-full rounded-xl text-base font-medium">
                  <Link href="/orders">
                    Xem chi tiết đơn hàng <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-12 w-full rounded-xl text-base">
                  <Link href={ROUTES.HOME}>
                    <Home className="mr-2 h-4 w-4" /> Về trang chủ
                  </Link>
                </Button>
              </>
            ) : (
              <Button
                asChild
                className="h-12 w-full rounded-xl text-base font-medium"
                variant="default"
              >
                <Link href={ROUTES.HOME}>
                  <Home className="mr-2 h-4 w-4" /> Về trang chủ để thử lại
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[80vh] flex-col items-center justify-center space-y-4">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="animate-pulse font-medium text-slate-500">
            Đang xử lý kết quả thanh toán...
          </p>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
