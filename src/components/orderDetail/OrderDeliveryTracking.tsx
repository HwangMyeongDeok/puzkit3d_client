import type { DeliveryTracking } from '@/types/api/delivery.api.types';

export default function OrderDeliveryTracking({ effectiveStatus, trackingData }: any) {
  if (
    !['HandedOverToDelivery', 'Delivering', 'Delivered'].includes(effectiveStatus || '') ||
    trackingData.length === 0
  )
    return null;

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
      <p className="mb-4 flex items-center gap-2 text-base font-bold text-blue-900">
        <span className="text-xl">📦</span> Live Delivery Tracking
      </p>
      <div className="flex flex-col gap-4">
        {trackingData.slice(0, 3).map((tracking: DeliveryTracking, index: number) => (
          <div key={tracking.id} className="flex items-start gap-3 text-sm text-blue-900">
            <div className="mt-1 flex flex-col items-center">
              <div
                className={`h-2.5 w-2.5 rounded-full ${index === 0 ? 'bg-blue-600 ring-4 ring-blue-600/20' : 'bg-blue-300'}`}
              />
              {index !== Math.min(trackingData.length, 3) - 1 && (
                <div className="mt-1 h-full min-h-8 w-0.5 bg-blue-200" />
              )}
            </div>
            <div className="flex-1 pb-2">
              <p className={`font-semibold ${index === 0 ? 'text-blue-800' : 'text-blue-700/70'}`}>
                {tracking.status} {tracking.deliveryOrderCode && ` (${tracking.deliveryOrderCode})`}
              </p>
              {tracking.note && <p className="mt-1 text-xs text-blue-700/80">{tracking.note}</p>}
              {tracking.createdAt && (
                <p className="mt-1 text-xs font-medium text-blue-600/60">
                  {new Date(tracking.createdAt).toLocaleString('en-US')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
