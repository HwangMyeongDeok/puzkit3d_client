import type { DeliveryTracking } from '@/types/api/delivery.api.types';

export function getEffectiveOrderStatus(
  orderStatus: string | undefined,
  trackingData: DeliveryTracking[]
): string | undefined {
  if (
    orderStatus &&
    ['HandedOverToDelivery', 'Delivering'].includes(orderStatus) &&
    trackingData.length > 0
  ) {
    const s = trackingData[0].status?.toLowerCase() || '';
    if (s.includes('return')) return 'Returned';
    if (s.includes('delivered')) return 'Delivered';
    if (s.includes('delivering')) return 'Delivering';
  }
  return orderStatus;
}
