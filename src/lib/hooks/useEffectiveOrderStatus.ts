// lib/hooks/useEffectiveOrderStatus.ts
import { useDeliveryTracking } from '@/lib/hooks/useDeliveryTracking';
import { getEffectiveOrderStatus } from '@/lib/utils/getEffectiveOrderStatus';
import type { DeliveryTracking } from '@/types/api/delivery.api.types';
import { InstockOrderStatus } from '@/types/api/order.api.types';

const NEEDS_TRACKING = ['HandedOverToDelivery', 'Delivering'];

export function useEffectiveOrderStatus(orderId: string, orderStatus: InstockOrderStatus) {
  const needsTracking = !!orderStatus && NEEDS_TRACKING.includes(orderStatus);

  const { data: deliveryData } = useDeliveryTracking({
    orderId,
    orderStatus,
    enabled: needsTracking,
  });

  const originalTrackingData: DeliveryTracking[] =
    deliveryData?.data?.filter((t: DeliveryTracking) => t.type === 'Original') || [];

  return getEffectiveOrderStatus(orderStatus, originalTrackingData);
}
