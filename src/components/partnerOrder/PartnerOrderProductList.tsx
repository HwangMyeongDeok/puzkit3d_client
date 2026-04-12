'use client';

import Image from 'next/image';
import { Package } from 'lucide-react';
import { useGetPartnerProductByIdQuery } from '@/lib/api/endpoints/partnerProductApi';
import { formatPrice } from '@/lib/utils';
import type { PartnerQuotationDetail } from '@/lib/api/endpoints/partnerProductQuotationApi';

function PartnerOrderProductRow({
  productId,
  quantity,
  totalAmount,
}: {
  productId: string;
  quantity: number;
  totalAmount: number;
}) {
  const { data: product } = useGetPartnerProductByIdQuery(productId, {
    skip: !productId,
  });

  const image =
    product?.thumbnailUrl || product?.previewImages?.[0] || product?.previewAssets?.[0] || '';

  const unitPrice = quantity > 0 ? totalAmount / quantity : totalAmount;

  return (
    <div className="px-6 py-5 transition-colors hover:bg-slate-50/40">
      <div className="mb-4 flex items-start gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm">
          {image ? (
            <Image
              src={image}
              alt={product?.name || productId}
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="truncate text-sm leading-tight font-semibold text-slate-900">
              {product?.name || productId}
            </span>
            <span className="text-xs text-slate-500">Partner product</span>
            <div className="text-sm text-slate-600">
              {formatPrice(unitPrice)} × {quantity}
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold whitespace-nowrap text-slate-900">
              {formatPrice(totalAmount)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PartnerOrderProductList({
  quotation,
}: {
  quotation?: PartnerQuotationDetail;
}) {
  const details = quotation?.details ?? [];

  return (
    <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
        <Package className="text-brand h-5 w-5" />
        Ordered Products ({details.length})
      </h3>

      {details.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {details.map((item) => (
            <PartnerOrderProductRow
              key={item.id}
              productId={item.partnerProductId}
              quantity={item.quantity}
              totalAmount={item.totalAmount}
            />
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