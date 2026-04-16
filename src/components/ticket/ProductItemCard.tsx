import Image from 'next/image';
import { Package, MessageSquareQuote, HardDrive, Loader2, ArrowDownRight } from 'lucide-react';
import type { TicketDetailDto } from '@/lib/api/endpoints/supportTicketApi';
import type { OrderDetailDto } from '@/types/api/order.api.types';
import { useGetDriveByIdQuery } from '@/lib/api/endpoints/driveApi';

interface ProductItemCardProps {
  detail: TicketDetailDto;
  orderDetail?: OrderDetailDto;
  isLoading: boolean;
  ticketType?: string;
}

export default function ProductItemCard({
  detail,
  orderDetail,
  isLoading,
  ticketType,
}: ProductItemCardProps) {
  const driveId = detail.driveId;
  const isDriveTicket = ticketType === 'ReplaceDrive' && !!driveId;

  // Gọi API lấy thông tin drive
  const { data: driveData, isLoading: isDriveLoading } = useGetDriveByIdQuery(driveId as string, {
    skip: !isDriveTicket,
  });

  return (
    <div className="bg-card border-border flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md">
      {/* --- KHỐI 1: BỐI CẢNH - THÔNG TIN SẢN PHẨM GỐC --- */}
      <div
        className={`flex items-center gap-4 p-4 ${isDriveTicket ? 'bg-muted/10' : 'bg-transparent'}`}
      >
        {/* Hình ảnh */}
        <div className="bg-muted relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border shadow-sm">
          {isLoading ? (
            <div className="h-full w-full animate-pulse bg-slate-200 dark:bg-slate-800" />
          ) : orderDetail?.thumbnailUrl ? (
            <Image
              src={orderDetail.thumbnailUrl}
              alt={orderDetail.productName || 'Product'}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="text-muted-foreground h-6 w-6 opacity-50" />
            </div>
          )}
        </div>

        {/* Thông tin sản phẩm */}
        <div className="min-w-0 flex-1">
          {isLoading ? (
            <div className="space-y-2 py-1">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          ) : (
            <>
              <p className="text-muted-foreground mb-0.5 text-[10px] font-bold tracking-wider uppercase">
                Original Product
              </p>
              <p
                className="text-foreground truncate text-sm font-semibold"
                title={orderDetail?.productName}
              >
                {orderDetail?.productName || 'Unknown Product'}
              </p>
              {orderDetail?.variantName && (
                <p className="text-muted-foreground mt-0.5 truncate text-xs">
                  Variant: {orderDetail.variantName}
                </p>
              )}
            </>
          )}
        </div>

        {/* Hiển thị Quantity ở đây NẾU KHÔNG PHẢI là ticket thay drive (ví dụ Exchange product) */}
        {!isDriveTicket && (
          <div className="shrink-0 text-right">
            <span className="bg-secondary text-secondary-foreground inline-flex items-center rounded-md px-2 py-1 text-xs font-bold">
              Qty: {detail.quantity}
            </span>
          </div>
        )}
      </div>

      {/* Hiển thị Note ở đây NẾU KHÔNG PHẢI là ticket thay drive */}
      {!isDriveTicket && detail.note && (
        <div className="border-border bg-muted/5 border-t border-dashed px-4 py-3">
          <div className="flex items-start gap-2">
            <MessageSquareQuote className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-muted-foreground text-sm leading-relaxed italic">
              &ldquo;{detail.note}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* --- KHỐI 2: CHI TIẾT YÊU CẦU (CHỈ DÀNH CHO REPLACE DRIVE) --- */}
      {isDriveTicket && (
        <div className="border-border bg-background relative border-t p-4 pt-5">
          {/* Mũi tên chỉ hướng kết nối logic giữa Product và Drive */}
          <div className="border-border bg-background text-muted-foreground absolute top-[-10px] left-8 flex h-5 w-5 items-center justify-center rounded-full border">
            <ArrowDownRight className="h-3 w-3" />
          </div>

          <div className="flex flex-col rounded-lg border border-amber-200/80 bg-amber-50/40 dark:border-amber-900/50 dark:bg-amber-900/10">
            {/* Header của phần Drive */}
            <div className="flex items-start justify-between gap-3 p-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 flex shrink-0 items-center justify-center rounded-full bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/50 dark:text-amber-500">
                  <HardDrive className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-[10px] font-bold tracking-wider text-amber-800 uppercase dark:text-amber-500">
                    Requested Replacement Drive
                  </p>

                  {isDriveLoading ? (
                    <div className="mt-1 flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin text-amber-600" />
                      <span className="text-xs text-amber-700">Loading drive info...</span>
                    </div>
                  ) : driveData ? (
                    <div>
                      <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">
                        {driveData.name}
                      </p>
                      {driveData.description && (
                        <p className="mt-0.5 truncate text-xs text-amber-700/80 dark:text-amber-400/80">
                          {driveData.description}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="truncate text-sm font-medium text-amber-900 dark:text-amber-200">
                        ID: <span className="font-mono text-xs opacity-80">{driveId}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-amber-600/70">Info unavailable</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity ĐÃ ĐƯỢC MANG XUỐNG ĐÂY */}
              <div className="shrink-0 pt-1">
                <span className="inline-flex items-center rounded-md bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-200/50 dark:bg-amber-900/60 dark:text-amber-300 dark:ring-amber-800/50">
                  Qty: {detail.quantity}
                </span>
              </div>
            </div>

            {/* Note ĐÃ ĐƯỢC MANG XUỐNG ĐÂY */}
            {detail.note && (
              <div className="border-t border-amber-200/40 bg-white/40 p-3 dark:border-amber-800/30 dark:bg-black/20">
                <div className="flex items-start gap-2">
                  <MessageSquareQuote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600/60 dark:text-amber-500/60" />
                  <p className="text-sm leading-relaxed text-amber-900/80 italic dark:text-amber-100/70">
                    &ldquo;{detail.note}&rdquo;
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
