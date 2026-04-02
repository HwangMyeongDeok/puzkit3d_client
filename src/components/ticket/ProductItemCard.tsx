import Image from 'next/image';
import { Package, MessageSquareQuote, Puzzle, Loader2 } from 'lucide-react';
import type { TicketDetailDto } from '@/lib/api/endpoints/supportTicketApi';
import type { OrderDetailDto } from '@/types/api/order.api.types';

// 👉 IMPORT HOOK VỪA VIẾT VÀO ĐÂY
import { useGetPartByIdQuery } from '@/lib/api/endpoints/productApi';

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
  // Lấy productId từ orderDetail
  const productId = orderDetail?.productDetails?.productId;
  const partId = detail.partId;

  // 👉 GỌI API LẤY PART DATA
  // Chỉ gọi khi type là ReplacePart, có đủ partId và productId
  const shouldFetchPart = ticketType === 'ReplacePart' && !!partId && !!productId;

  const { data: partData, isLoading: isPartLoading } = useGetPartByIdQuery(
    { productId: productId as string, partId: partId as string },
    { skip: !shouldFetchPart }
  );

  return (
    <div className="bg-muted/30 border-border/50 hover:bg-muted/50 flex flex-col gap-3 rounded-xl border p-3 transition-colors">
      {/* --- KHỐI 1: THÔNG TIN SẢN PHẨM GỐC --- */}
      <div className="flex items-start gap-3">
        {/* ... (Đoạn này giữ nguyên như code trên kia) ... */}
        <div className="bg-card relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border shadow-sm">
          {isLoading ? (
            <div className="h-full w-full animate-pulse bg-slate-200 dark:bg-slate-800" />
          ) : orderDetail?.thumbnailUrl ? (
            <Image
              src={orderDetail.thumbnailUrl}
              alt={orderDetail.productName || 'Product'}
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="text-muted-foreground h-5 w-5" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {isLoading ? (
            <div className="space-y-2 py-1">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          ) : (
            <>
              <p
                className="text-foreground truncate text-sm font-semibold"
                title={orderDetail?.productName}
              >
                {orderDetail?.productName || 'Unknown Product'}
              </p>
              {orderDetail?.variantName && (
                <p className="text-muted-foreground mt-0.5 truncate text-xs">
                  {orderDetail.variantName}
                </p>
              )}
            </>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="bg-background inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold shadow-sm">
              ×{detail.quantity}
            </span>
          </div>
          {detail.note && (
            <div className="mt-2 flex items-start gap-1.5">
              <MessageSquareQuote className="text-muted-foreground mt-0.5 h-3 w-3 shrink-0" />
              <p className="text-muted-foreground text-xs leading-snug italic">
                &ldquo;{detail.note}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- KHỐI 2: THÔNG TIN PHỤ TÙNG (CHỈ HIỆN KHI REPLACE PART) --- */}
      {shouldFetchPart && (
        <div className="mt-1 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900/50 dark:bg-amber-900/10">
          <div className="mt-0.5 flex shrink-0 items-center justify-center rounded-md bg-amber-100 p-1.5 text-amber-600 dark:bg-amber-900/50 dark:text-amber-500">
            <Puzzle className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[10px] font-bold tracking-wider text-amber-800 uppercase dark:text-amber-500">
              Part to Replace
            </p>

            {isPartLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin text-amber-600" />
                <span className="text-xs text-amber-700">Đang tải thông tin phụ tùng...</span>
              </div>
            ) : partData ? (
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">
                  {partData.name}
                </p>
                <p className="text-xs text-amber-700/80 dark:text-amber-400/80">
                  Type: {partData.partType} • Code: {partData.code}
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                <p className="truncate text-sm font-medium text-amber-900 dark:text-amber-200">
                  Part ID:{' '}
                  <span className="font-mono text-xs font-normal opacity-80">{partId}</span>
                </p>
                <p className="mt-0.5 text-xs text-amber-600/70">
                  Không tải được thông tin phụ tùng
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
