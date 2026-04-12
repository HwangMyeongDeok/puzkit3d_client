'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Box, Eye, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import OrderBadge from '@/components/orderDetail/OrderBadge';
import { useGetPartnerQuotationByIdQuery } from '@/lib/api/endpoints/partnerProductQuotationApi';
import { useGetPartnerProductByIdQuery } from '@/lib/api/endpoints/partnerProductApi';
import { useGetDeliveryTrackingQuery } from '@/lib/api/endpoints/deliveryApi';
import type { PartnerOrderListItemDto } from '@/types/api/partner-order.api.types';
import {
  PARTNER_TERMINAL_STATUSES,
  getOriginalOrLatestTrackings,
  getPartnerDisplayStatus,
} from '@/lib/utils/order-status';

function PartnerPreviewItem({ productId, quantity }: { productId: string; quantity: number }) {
  const { data: product } = useGetPartnerProductByIdQuery(productId, {
    skip: !productId,
  });

  const image =
    product?.thumbnailUrl || product?.previewImages?.[0] || product?.previewAssets?.[0] || '';

  return (
    <div className="bg-muted/30 border-border/50 hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-2 transition-colors">
      <div className="bg-card relative h-14 w-14 shrink-0 overflow-hidden rounded-md border shadow-sm">
        {image ? (
          <Image
            src={image}
            alt={product?.name || productId}
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-sm font-semibold" title={product?.name}>
          {product?.name || productId}
        </p>

        <div className="mt-1 flex items-center justify-between">
          <p className="text-muted-foreground truncate text-xs">Partner product</p>
          <span className="bg-background rounded-full border px-2 py-0.5 text-xs font-bold shadow-sm">
            x{quantity}
          </span>
        </div>
      </div>
    </div>
  );
}

interface Props {
  order: PartnerOrderListItemDto;
  onPayNow: (orderId: string) => void;
}

export default function PartnerOrderCard({ order, onPayNow }: Props) {
  const { data: quotation } = useGetPartnerQuotationByIdQuery(order.partnerProductQuotationId, {
    skip: !order.partnerProductQuotationId,
  });

  const { data: deliveryResponse } = useGetDeliveryTrackingQuery(
    {
      orderId: order.id,
      pageNumber: 1,
      pageSize: 10,
    },
    {
      skip: !order.id,
    }
  );

  const trackingData = getOriginalOrLatestTrackings(deliveryResponse?.data ?? []);
  const effectiveStatus = getPartnerDisplayStatus(order.status, trackingData) || order.status;

  const canPayNow =
    !order.isPaid &&
    order.paymentMethod === 'Online' &&
    order.status &&
    !PARTNER_TERMINAL_STATUSES.includes(order.status);

  const details = quotation?.details ?? [];

  return (
    <div className="bg-card border-border hover:border-brand/30 flex flex-col gap-4 rounded-xl border p-5 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="border-border flex flex-col justify-between gap-4 border-b pb-4 md:flex-row md:items-start">
        <div className="flex items-start gap-3">
          <div className="bg-brand/10 text-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
            <Box className="h-6 w-6" />
          </div>

          <div>
            <h3 className="text-lg leading-none font-bold">
              Order #{order.code || order.id.split('-')[0].toUpperCase()}
            </h3>

            <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Updating'}
              </span>

              <span className="flex items-center gap-1.5 border-l border-slate-300 pl-3">
                <Wallet className="h-4 w-4 text-slate-500" />
                <span className="font-medium text-slate-700">{order.paymentMethod}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <OrderBadge status={effectiveStatus} />
        </div>
      </div>

      <div className="py-2">
        {details.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {details.slice(0, 3).map((item) => (
              <PartnerPreviewItem
                key={item.id}
                productId={item.partnerProductId}
                quantity={item.quantity}
              />
            ))}

            {details.length > 3 && (
              <div className="border-border text-muted-foreground bg-muted/10 flex h-full min-h-16 items-center justify-center rounded-lg border border-dashed text-xs font-medium">
                +{details.length - 3} other products
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm italic">No preview images.</p>
        )}
      </div>

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
          {canPayNow ? (
            <Button onClick={() => onPayNow(order.id)} className="h-11 rounded-lg px-6">
              Pay Now
            </Button>
          ) : null}

          <Link
            href={`/profile/partner-orders/${order.id}`}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-6 py-2.5 font-semibold shadow-sm transition-colors md:w-auto"
          >
            <Eye className="h-4 w-4" /> View Details
          </Link>
        </div>
      </div>
    </div>
  );
}