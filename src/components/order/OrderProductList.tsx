import { Package } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { OrderDetailDto } from '@/types/api/order.api.types';
import { OrderFeedbackSection } from '@/components/feedback/OrderFeedbackSection';

interface OrderProductListProps {
  orderDetails: OrderDetailDto[];
  orderId: string;
  canFeedback: boolean;
}

export function OrderProductList({ orderDetails, orderId, canFeedback }: OrderProductListProps) {
  return (
    <div className="flex flex-col gap-0 overflow-hidden rounded-lg border border-slate-100 bg-white shadow-md">
      <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
          <Package className="h-5 w-5 text-blue-600" />
          Products ({orderDetails?.length || 0})
        </h3>
      </div>

      {orderDetails && orderDetails.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {orderDetails.map((item: OrderDetailDto, idx: number) => (
            <div key={item.id} className="px-6 py-5 transition-colors hover:bg-slate-50/40">
              {/* Product Info */}
              <div className="mb-4 flex items-start gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnailUrl || ''}
                    alt={item.productName || ''}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="cursor-pointer truncate text-sm leading-tight font-semibold text-slate-900 transition-colors hover:text-blue-600">
                      {item.productName || item.sku || item.id}
                    </span>
                    {item.variantName && (
                      <span className="text-xs text-slate-500">{item.variantName}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-600">
                      {item.unitPrice?.toLocaleString('vi-VN')} ₫ × {item.quantity}
                    </div>
                    <div className="mt-1 text-base font-bold text-blue-600">
                      {item.totalAmount ? item.totalAmount.toLocaleString('vi-VN') : 0} ₫
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback Block */}
              {canFeedback && (
                <div className="ml-0 sm:ml-28">
                  <OrderFeedbackSection
                    orderDetailId={item.id}
                    orderId={orderId}
                    productName={item.productName || item.sku}
                    thumbnailUrl={item.thumbnailUrl}
                    variantName={item.variantName}
                    isInstockOrPartner={true}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <p className="text-sm text-slate-400">No products in this order.</p>
        </div>
      )}
    </div>
  );
}
