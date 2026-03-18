'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, ChevronRight, Home, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();

  // VNPAY often returns vnp_ResponseCode
  // '00' is usually success
  const responseCode = searchParams.get('vnp_ResponseCode');
  const amountParam = searchParams.get('vnp_Amount');

  const isSuccess = responseCode === '00' || responseCode === null;
  // Treat as success if there's no code (just in case they navigate directly)

  const amount = amountParam ? parseInt(amountParam, 10) / 100 : null; // VNPAY amount is usually multiplied by 100

  return (
    <div className="container-custom flex min-h-[70vh] flex-col items-center justify-center py-12 text-center">
      <div
        className={`mb-6 flex h-24 w-24 items-center justify-center rounded-full ${isSuccess ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}
      >
        {isSuccess ? <CheckCircle2 className="h-12 w-12" /> : <XCircle className="h-12 w-12" />}
      </div>

      <h1 className="mb-2 text-3xl font-bold md:text-4xl">
        {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
      </h1>

      <p className="text-muted-foreground mb-8 max-w-md text-lg">
        {isSuccess
          ? 'Cảm ơn bạn đã mua sắm tại Puzkit3D. Đơn hàng của bạn đã được ghi nhận và đang trong quá trình xử lý.'
          : 'Giao dịch của bạn đã bị hủy hoặc có lỗi xảy ra. Vui lòng kiểm tra lại phương thức thanh toán hoặc liên hệ bộ phận hỗ trợ ngân hàng của bạn.'}
      </p>

      {isSuccess && amount && (
        <div className="bg-card border-border mb-8 overflow-hidden rounded-xl border">
          <div className="bg-muted px-6 py-3 text-sm font-medium">Chi tiết thanh toán</div>
          <div className="flex flex-col gap-2 p-6">
            <div className="flex justify-between gap-12 font-medium">
              <span className="text-muted-foreground">Tổng tiền:</span>
              <span>{amount.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <Button asChild variant={isSuccess ? 'outline' : 'default'} className="h-12 px-8">
          <Link href={ROUTES.HOME}>
            <Home className="mr-2 h-5 w-5" />
            Về trang chủ
          </Link>
        </Button>

        {isSuccess && (
          <Button asChild className="h-12 px-8">
            <Link href="/orders">
              <Receipt className="mr-2 h-5 w-5" />
              Xem đơn hàng
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          Đang tải kết quả thanh toán...
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
