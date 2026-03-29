import Image from 'next/image';
import { Package, MessageSquareQuote } from 'lucide-react';
import type { TicketDetailDto } from '@/lib/api/endpoints/supportTicketApi';
import type { OrderDetailDto } from '@/types/api/order.api.types';

interface ProductItemCardProps {
  detail: TicketDetailDto;
  orderDetail?: OrderDetailDto;
  isLoading: boolean;
}

export default function ProductItemCard({ detail, orderDetail, isLoading }: ProductItemCardProps) {
  return (
    <div className="bg-muted/30 border-border/50 hover:bg-muted/50 flex items-start gap-3 rounded-xl border p-3 transition-colors">
      {/* Thumbnail */}
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

      {/* Info */}
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
  );
}
