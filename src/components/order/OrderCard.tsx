import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Box,
  Eye,
  CreditCard,
  Wallet,
  Banknote,
  AlertCircle, // 👉 Thêm icon này cho Badge
  Ticket, // 👉 Thêm icon này cho nút View Ticket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import OrderBadge from '../orderDetail/OrderBadge';

// Import Types chuẩn từ API của ông
import type {
  GetCustomerOrderResponseDto,
  InstockOrderStatus,
  OrderPreviewDto,
} from '@/types/api/order.api.types';
import { useGetTicketByOrderIdQuery } from '@/lib/api/endpoints/supportTicketApi';

const TERMINAL_STATUSES: InstockOrderStatus[] = ['Cancelled', 'Rejected', 'Returned', 'Completed'];

interface OrderCardProps {
  order: GetCustomerOrderResponseDto;
  onPayNow: (orderId: string) => void;
}

export default function OrderCard({ order, onPayNow }: OrderCardProps) {
  const isOnlinePayment = order.paymentMethod === 'Online';
  const PaymentIcon = isOnlinePayment ? Wallet : Banknote;

  const { data: ticketInfo, isSuccess } = useGetTicketByOrderIdQuery(order.id);

  const hasComplaint = isSuccess && ticketInfo != null;

  return (
    <div className="bg-card border-border hover:border-brand/30 flex flex-col gap-4 rounded-xl border p-5 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* 1. CARD HEADER */}
      <div className="border-border flex flex-col justify-between gap-4 border-b pb-4 md:flex-row md:items-start">
        <div className="flex items-start gap-3">
          <div className="bg-brand/10 text-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
            <Box className="h-6 w-6" />
          </div>
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="text-lg leading-none font-bold">
                Order #{order.code || order.id.split('-')[0].toUpperCase()}
              </h3>

              {/* 👉 THÊM BADGE CẢNH BÁO KHIẾU NẠI Ở ĐÂY */}
              {hasComplaint && (
                <span className="flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-rose-700 uppercase dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
                  <AlertCircle className="h-3 w-3" />
                  Complaint Opened
                </span>
              )}
            </div>

            <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Updating'}
              </span>
              <span className="flex items-center gap-1.5 border-l border-slate-300 pl-3">
                <PaymentIcon className="h-4 w-4 text-slate-500" />
                <span className="font-medium text-slate-700">{order.paymentMethod}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <OrderBadge status={order.status} />
        </div>
      </div>

      {/* 2. PREVIEW PRODUCTS */}
      <div className="py-2">
        {order.orderDetailsPreview && order.orderDetailsPreview.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {order.orderDetailsPreview.slice(0, 3).map((preview: OrderPreviewDto, idx) => (
              <div
                key={idx}
                className="bg-muted/30 border-border/50 hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-2 transition-colors"
              >
                <div className="bg-card relative h-14 w-14 shrink-0 overflow-hidden rounded-md border shadow-sm">
                  <Image
                    src={preview.thumbnailUrl || ''}
                    alt={preview.productName || 'Product'}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-foreground truncate text-sm font-semibold"
                    title={preview.productName}
                  >
                    {preview.productName}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-muted-foreground truncate text-xs">{preview.variantName}</p>
                    <span className="bg-background rounded-full border px-2 py-0.5 text-xs font-bold shadow-sm">
                      x{preview.quantity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {order.orderDetailsPreview.length > 3 && (
              <div className="border-border text-muted-foreground bg-muted/10 flex h-full min-h-16 items-center justify-center rounded-lg border border-dashed text-xs font-medium">
                +{order.orderDetailsPreview.length - 3} other products
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm italic">No preview images.</p>
        )}
      </div>

      {/* 3. CARD FOOTER */}
      <div className="border-border flex flex-col justify-between gap-4 border-t pt-4 md:flex-row md:items-center">
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Total Amount
          </span>
          <span className="text-brand text-xl font-bold">
            {formatPrice(order.grandTotalAmount ?? 0)}
          </span>
        </div>

        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
          {/* Nút Pay Now */}
          {!order.isPaid &&
            isOnlinePayment &&
            order.status &&
            !TERMINAL_STATUSES.includes(order.status) && (
              <Button
                onClick={() => onPayNow(order.id)}
                className="bg-brand hover:bg-brand/90 h-11 w-full gap-2 font-bold md:w-auto"
              >
                <CreditCard className="h-4 w-4" /> Pay Now
              </Button>
            )}

          {/* 👉 THÊM NÚT VIEW TICKET NẾU CÓ KHIẾU NẠI */}
          {hasComplaint && ticketInfo && (
            <Link
              // Sửa lại URL trỏ thẳng vô trang danh sách ticket hoặc chi tiết ticket của ông nha
              href={`/ticket-support/${ticketInfo.id}`}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-6 py-2.5 font-semibold text-rose-700 shadow-sm transition-colors hover:bg-rose-100 md:w-auto dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
            >
              <Ticket className="h-4 w-4" /> View Ticket
            </Link>
          )}

          {/* Nút View Details */}
          <Link
            href={`/orders/${order.id}`}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-6 py-2.5 font-semibold shadow-sm transition-colors md:w-auto"
          >
            <Eye className="h-4 w-4" /> View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
