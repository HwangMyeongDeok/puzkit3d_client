'use client';

import { Truck, CalendarDays, Check, Camera, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

import { useGetWaybillNumberQuery } from '@/lib/api/endpoints/deliveryApi';
import Image from 'next/image';

const DELIVERY_STEPS = ['Pending', 'ReadyToPick', 'HandedOver', 'Delivering', 'Delivered'];

const getDeliveryStepIndex = (status: string | undefined | null) => {
  if (!status) return 0;
  const s = status.toLowerCase();
  if (s.includes('delivered')) return 4;
  if (s.includes('delivering')) return 3;
  if (s.includes('handed')) return 2;
  if (s.includes('ready')) return 1;
  return 0;
};

export default function DeliveryTrackingCard({
  deliveryTracking,
  isLoading,
}: {
  deliveryTracking: any;
  isLoading: boolean;
}) {
  // 👉 Fetch Waybill URL
  const { data: waybillUrl, isLoading: isWaybillLoading } = useGetWaybillNumberQuery(
    deliveryTracking?.id,
    { skip: !deliveryTracking?.id }
  );

  if (!isLoading && !deliveryTracking) return null;

  return (
    <div className="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
      <div className="bg-muted/30 border-border flex flex-col justify-between gap-4 border-b p-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 text-primary mt-1 rounded-lg p-2">
            <Truck className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold">Delivery Tracking</h2>
              {/* 👉 Badge hiển thị Type: Return hoặc Resend */}
              {deliveryTracking?.type && (
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] tracking-wider uppercase shadow-sm',
                    deliveryTracking.type === 'Return'
                      ? 'border-amber-200 bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                      : 'border-indigo-200 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                  )}
                >
                  {deliveryTracking.type}
                </Badge>
              )}
            </div>

            <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1">
              {deliveryTracking?.deliveryOrderCode && (
                <p className="text-muted-foreground font-mono text-sm">
                  Code:{' '}
                  <span className="text-foreground font-semibold">
                    {deliveryTracking.deliveryOrderCode}
                  </span>
                </p>
              )}

              {/* 👉 Link Waybill */}
              {isWaybillLoading ? (
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Loader2 className="h-3 w-3 animate-spin" /> Loading Waybill...
                </span>
              ) : waybillUrl ? (
                <a
                  href={waybillUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View Waybill <ExternalLink className="h-3 w-3" />
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {deliveryTracking?.expectedDeliveryDate && (
          <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-500">
            <CalendarDays className="h-4 w-4" />
            <span>
              Expected:{' '}
              <span className="font-semibold">
                {new Date(deliveryTracking.expectedDeliveryDate).toLocaleDateString('en-US')}
              </span>
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="custom-scrollbar w-full overflow-x-auto pb-4">
              <div className="relative flex w-full min-w-[500px] items-start justify-between">
                {DELIVERY_STEPS.map((step, index) => {
                  const currentIndex = getDeliveryStepIndex(deliveryTracking?.status);
                  const isCompleted = index <= currentIndex;
                  const isActive = index === currentIndex;

                  return (
                    <div key={step} className="relative flex flex-1 flex-col items-center">
                      {index !== DELIVERY_STEPS.length - 1 && (
                        <div
                          className={cn(
                            'absolute top-4 left-[50%] z-0 h-1 w-full -translate-y-1/2 transition-all duration-500',
                            index < currentIndex ? 'bg-primary' : 'bg-muted'
                          )}
                        />
                      )}
                      <div
                        className={cn(
                          'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all',
                          isCompleted
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'bg-background border-muted text-muted-foreground',
                          isActive && 'ring-primary/20 ring-4'
                        )}
                      >
                        {isCompleted ? <Check className="h-4 w-4 stroke-3" /> : index + 1}
                      </div>
                      <span
                        className={cn(
                          'mt-3 max-w-[80px] text-center text-xs font-semibold',
                          isCompleted ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {deliveryTracking?.handOverImageUrl && (
              <div className="bg-muted/40 border-border/50 mt-2 rounded-lg border p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Camera className="text-muted-foreground h-4 w-4" />
                  Handover Evidence
                </h3>
                <a
                  href={deliveryTracking.handOverImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={deliveryTracking.handOverImageUrl}
                    alt="Delivery Proof"
                    className="border-border h-auto w-48 rounded-md border object-cover transition-opacity hover:opacity-90"
                  />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
