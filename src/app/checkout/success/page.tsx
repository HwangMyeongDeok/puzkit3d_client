'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Package, CreditCard, LayoutList } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { useGetCustomerOrderByIdQuery } from '@/lib/api/endpoints/orderApi';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const { data: order } = useGetCustomerOrderByIdQuery(orderId || '', {
    skip: !orderId,
  });

  return (
    <div className="container-custom flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-6">
        <div className="bg-success/20 absolute -inset-4 rounded-full blur-xl" />
        <div className="bg-success/10 relative flex h-24 w-24 items-center justify-center rounded-full">
          <CheckCircle className="text-success h-14 w-14" />
        </div>
      </div>

      <h1 className="mb-3 text-3xl font-extrabold md:text-4xl">Đặt hàng thành công!</h1>

      <p className="text-muted-foreground mx-auto mb-2 max-w-md">
        Cảm ơn bạn đã mua hàng.{' '}
        {orderId
          ? 'Mã đơn hàng của bạn là'
          : 'Chúng tôi sẽ gửi email xác nhận trong thời gian sớm nhất.'}
      </p>

      {orderId && (
        <div className="border-border bg-card my-6 inline-flex flex-col items-center gap-6 rounded-xl border px-6 py-4 shadow-sm sm:flex-row">
          <div className="flex items-center gap-3">
            <Package className="text-brand h-6 w-6" />
            <div className="text-left">
              <p className="text-muted-foreground text-xs tracking-wider uppercase">Mã đơn hàng</p>
              <p className="text-card-foreground text-lg font-bold">
                #{orderId.split('-')[0].toUpperCase()}
              </p>
            </div>
          </div>

          <div className="bg-border hidden h-10 w-px sm:block"></div>

          <div className="text-left">
            <p className="text-muted-foreground w-full text-center text-xs tracking-wider uppercase sm:text-left">
              Phương thức
            </p>
            <p className="text-card-foreground font-semibold">
              {order?.paymentMethod === 'Online'
                ? 'Thanh toán trực tuyến'
                : 'Thanh toán khi nhận hàng (COD)'}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link href={ROUTES.ORDERS}>
          <Button size="lg" className="gap-2 rounded-xl px-8 shadow-sm">
            <LayoutList className="h-4 w-4" />
            Quản lý đơn hàng
          </Button>
        </Link>
        <Link href={ROUTES.PRODUCTS}>
          <Button variant="outline" size="lg" className="gap-2 rounded-xl px-8">
            Tiếp tục mua sắm
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={<div className="flex min-h-[70vh] items-center justify-center">Đang tải...</div>}
    >
      <SuccessContent />
    </Suspense>
  );
}
