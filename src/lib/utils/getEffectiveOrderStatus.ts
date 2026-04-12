import type { DeliveryTracking } from '@/types/api/delivery.api.types';
import type { InstockOrderStatus } from '@/types/api/order.api.types';

export function getEffectiveOrderStatus(
  orderStatus: string | undefined,
  trackingData: DeliveryTracking[] = []
): InstockOrderStatus | undefined {
  if (!orderStatus) return undefined;

  const activeDeliveryStatuses = ['HandedOverToDelivery', 'Delivering'];

  if (activeDeliveryStatuses.includes(orderStatus) && trackingData.length > 0) {
    const latestStatus = trackingData[0]?.status?.toLowerCase() ?? '';

    if (latestStatus.includes('return')) return 'Returned';
    if (latestStatus.includes('delivered')) return 'Delivered';
    if (latestStatus.includes('delivering')) return 'Delivering';
  }

  return orderStatus as InstockOrderStatus;
}
