'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Receipt, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetCustomerOrdersQuery } from '@/lib/api/endpoints/orderApi';

// Components đã tách
import PaymentActionDialog from '@/components/checkout/PaymentActionDialog';
import OrderStatusFilter from '@/components/order/OrderStatusFilter';
import OrderCard from '@/components/order/OrderCard';
import { InstockOrderStatus } from '@/types/api/order.api.types';

export default function OrdersPage() {
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);

  // State quản lý Filter và Phân trang (Pagination)
  const [selectedStatus, setSelectedStatus] = useState<InstockOrderStatus | ''>('');
  const [page, setPage] = useState<number>(1);

  // Gọi API (có param phân trang đàng hoàng)
  const { data, isLoading, isFetching, isError } = useGetCustomerOrdersQuery(
    {
      pageNumber: page,
      pageSize: 5, // Tạm để 5 cho ông dễ test nút Next/Prev, mốt chỉnh lại 10
      ...(selectedStatus ? { status: selectedStatus } : {}),
    },
    { refetchOnMountOrArgChange: true }
  );

  const orders = data?.items || [];
  const hasNextPage = data?.hasNextPage;
  const hasPrevPage = data?.hasPreviousPage;

  // Xử lý khi đổi tab status thì reset về trang 1
  const handleStatusChange = (status: InstockOrderStatus | '') => {
    setSelectedStatus(status);
    setPage(1);
  };

  return (
    <div className="container-custom min-h-screen bg-slate-50/30 py-8 lg:py-12">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">Order History</h1>

        {/* 1. Thanh Filter */}
        <OrderStatusFilter selectedStatus={selectedStatus} onChange={handleStatusChange} />

        {/* 2. Loading & Empty States */}
        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="text-brand h-8 w-8 animate-spin" />
          </div>
        ) : isError ? (
          <div className="bg-destructive/10 text-destructive border-destructive/20 rounded-xl border p-6 text-center shadow-sm">
            <p className="font-medium">An error occurred while loading order history.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="border-border flex flex-col items-center justify-center rounded-xl border bg-white py-20 text-center shadow-sm">
            <Receipt className="text-muted-foreground/30 mb-5 h-20 w-20" />
            <h2 className="mb-2 text-xl font-bold text-slate-700">
              {selectedStatus ? 'No orders found for this status' : 'No orders yet'}
            </h2>
            <p className="text-muted-foreground mb-8">
              {selectedStatus
                ? 'Try selecting "All Orders" to see your full history.'
                : "You haven't made any transactions yet."}
            </p>
            {!selectedStatus && (
              <Link
                href="/shop"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-xl px-8 py-3 font-semibold shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Package className="h-5 w-5" />
                Discover Products
              </Link>
            )}
          </div>
        ) : (
          /* 3. Render List Order */
          <div className="relative flex flex-col gap-5">
            {/* Overlay mờ đi khi đang fecth trang mới (Tránh user spam click) */}
            {isFetching && !isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/50 backdrop-blur-[1px]">
                <Loader2 className="text-brand h-8 w-8 animate-spin" />
              </div>
            )}

            {orders.map((order) => (
              <OrderCard key={order.id} order={order} onPayNow={(id) => setPaymentOrderId(id)} />
            ))}

            {/* 4. THANH PHÂN TRANG (PAGINATION) */}
            {(hasPrevPage || hasNextPage) && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  disabled={!hasPrevPage || isFetching}
                  onClick={() => setPage((p) => p - 1)}
                  className="gap-2 rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
                  Page {data.pageNumber} / {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={!hasNextPage || isFetching}
                  onClick={() => setPage((p) => p + 1)}
                  className="gap-2 rounded-lg"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <PaymentActionDialog
        open={!!paymentOrderId}
        orderId={paymentOrderId}
        onClose={() => setPaymentOrderId(null)}
      />
    </div>
  );
}
