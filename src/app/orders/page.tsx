'use client';

import { useGetCustomerOrdersQuery } from '@/lib/api/endpoints/orderApi';
import { Loader2, Package, Eye, Receipt, Calendar, CreditCard, Box } from 'lucide-react';
import Link from 'next/link';

// Giả định backend trả về Int Status: 0=Pending, 1=Confirmed, 2=Shipping, 3=Completed...
const getStatusBadge = (status?: number) => {
  switch (status) {
    case 0:
      return (
        <span className="rounded-md border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-1 text-xs font-semibold tracking-wider text-yellow-600 uppercase">
          Chờ xác nhận
        </span>
      );
    case 1:
      return (
        <span className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold tracking-wider text-blue-600 uppercase">
          Đang xử lý
        </span>
      );
    case 2:
      return (
        <span className="rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold tracking-wider text-indigo-600 uppercase">
          Đang giao
        </span>
      );
    case 3:
      return (
        <span className="rounded-md border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-xs font-semibold tracking-wider text-green-600 uppercase">
          Hoàn thành
        </span>
      );
    case 4:
      return (
        <span className="bg-destructive/10 text-destructive border-destructive/20 rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wider uppercase">
          Đã hủy
        </span>
      );
    default:
      return (
        <span className="bg-muted text-muted-foreground border-border rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wider uppercase">
          Không xác định
        </span>
      );
  }
};

export default function OrdersPage() {
  const { data, isLoading, isError } = useGetCustomerOrdersQuery({ pageNumber: 1, pageSize: 10 });

  const orders = data?.items || [];

  return (
    <div className="container-custom py-8 lg:py-12">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold md:text-3xl">Lịch sử mua hàng</h1>

        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="text-brand h-8 w-8 animate-spin" />
          </div>
        ) : isError ? (
          <div className="bg-destructive/10 text-destructive rounded-xl p-6 text-center">
            <p>Có lỗi xảy ra khi tải lịch sử đơn hàng.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-card border-border flex flex-col items-center justify-center rounded-xl border py-16 text-center">
            <Receipt className="text-muted-foreground/40 mb-4 h-16 w-16" />
            <h2 className="mb-2 text-xl font-bold">Chưa có đơn hàng nào</h2>
            <p className="text-muted-foreground mb-6">Bạn chưa thực hiện bất kỳ giao dịch nào.</p>
            <Link
              href="/shop"
              className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-xl px-6 py-2.5 font-semibold"
            >
              <Package className="h-4 w-4" />
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-card border-border hover:border-brand/30 flex flex-col gap-4 rounded-xl border p-5 shadow-sm transition-all"
              >
                {/* Card Header: ID, Date, Status */}
                <div className="border-border flex flex-col justify-between gap-4 border-b pb-4 md:flex-row md:items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-brand/10 text-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                      <Box className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-lg leading-none font-bold">
                        Đơn hàng #{order.code || order.id.split('-')[0].toUpperCase()}
                      </h3>
                      <div className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Đang cập nhật'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start md:self-auto">
                    {getStatusBadge(order.status)}
                    {order.isPaid ? (
                      <span className="bg-success/10 text-success border-success/20 flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold uppercase">
                        <CreditCard className="h-3 w-3" /> Đã thanh toán
                      </span>
                    ) : (
                      <span className="bg-muted text-muted-foreground border-border flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold uppercase">
                        <CreditCard className="h-3 w-3" /> Chưa thanh toán
                      </span>
                    )}
                  </div>
                </div>

                {/* Preview Items Strip */}
                <div className="py-2">
                  {order.orderDetailsPreview && order.orderDetailsPreview.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {order.orderDetailsPreview.slice(0, 3).map((preview, idx) => (
                        <div
                          key={idx}
                          className="bg-muted/30 border-border/50 hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-2 transition-colors"
                        >
                          <div className="bg-card h-14 w-14 shrink-0 overflow-hidden rounded-md border shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={preview.thumbnailUrl || ''}
                              alt={preview.productName || ''}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-foreground truncate text-sm font-semibold">
                              {preview.productName}
                            </p>
                            <div className="mt-1 flex items-center justify-between">
                              <p className="text-muted-foreground truncate text-xs">
                                {preview.variantName}
                              </p>
                              <span className="bg-background rounded-full border px-2 py-0.5 text-xs font-bold">
                                x{preview.quantity}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {order.orderDetailsPreview.length > 3 && (
                        <div className="border-border text-muted-foreground bg-muted/10 flex h-full min-h-[4rem] items-center justify-center rounded-lg border border-dashed text-xs font-medium">
                          +{order.orderDetailsPreview.length - 3} sản phẩm khác
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm italic">
                      Không có hình ảnh xem trước.
                    </p>
                  )}
                </div>

                {/* Card Footer: Total and Actions */}
                <div className="border-border flex flex-col justify-between gap-4 border-t pt-4 md:flex-row md:items-center">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                      Tổng cộng
                    </span>
                    <span className="text-brand text-xl font-bold">
                      {order.grandTotalAmount ? order.grandTotalAmount.toLocaleString('vi-VN') : 0}{' '}
                      ₫
                    </span>
                  </div>

                  <Link
                    href={`/orders/${order.id}`}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-2.5 font-semibold shadow-sm transition-colors md:w-auto"
                  >
                    <Eye className="h-4 w-4" />
                    Xem chi tiết đơn hàng
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
