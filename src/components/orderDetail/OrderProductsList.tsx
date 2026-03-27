import { Package } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import type { GetCustomerOrderByIdResponseDto, OrderDetailDto } from '@/types/api/order.api.types';
import { OrderFeedbackSection } from '@/components/feedback/OrderFeedbackSection';

interface OrderProductsListProps {
  order: GetCustomerOrderByIdResponseDto;
  effectiveStatus?: string;
}

export default function OrderProductsList({ order, effectiveStatus }: OrderProductsListProps) {
  return (
    <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
        <Package className="text-brand h-5 w-5" />
        Ordered Products ({order.orderDetails?.length || 0})
      </h3>

      {order.orderDetails && order.orderDetails.length > 0 ? (
        <div className="flex flex-col">
          {order.orderDetails.map((item: OrderDetailDto, idx) => (
            <div key={item.id}>
              {idx > 0 && <Separator className="my-5" />}
              <div className="flex items-start gap-4">
                <div className="bg-muted h-16 w-16 shrink-0 overflow-hidden rounded-md border shadow-sm sm:h-24 sm:w-24">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnailUrl || ''}
                    alt={item.productName || ''}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:justify-between">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-foreground hover:text-brand cursor-pointer text-base leading-tight font-semibold transition-colors">
                      {item.productName || item.sku || item.id}
                    </span>
                    {item.variantName && (
                      <span className="text-muted-foreground text-sm">
                        Variant:{' '}
                        <span className="text-foreground font-medium">{item.variantName}</span>
                      </span>
                    )}
                    <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                      <span>{formatPrice(item.unitPrice ?? 0)}</span>
                      <span>✕</span>
                      <span className="text-foreground font-semibold">{item.quantity}</span>
                    </div>
                  </div>
                  <span className="text-brand text-lg font-bold whitespace-nowrap">
                    {formatPrice(item.totalAmount ?? 0)}
                  </span>
                </div>
              </div>

              {effectiveStatus === 'Completed' && (
                <OrderFeedbackSection
                  orderDetailId={item.id}
                  orderId={order.id}
                  productName={item.productName || item.sku || ''}
                  thumbnailUrl={item.thumbnailUrl}
                  variantName={item.variantName}
                  isInstockOrPartner={true}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-muted/20 rounded-lg border border-dashed py-8 text-center">
          <Package className="text-muted-foreground/50 mx-auto mb-2 h-8 w-8" />
          <p className="text-muted-foreground text-sm italic">No product data.</p>
        </div>
      )}
    </div>
  );
}
