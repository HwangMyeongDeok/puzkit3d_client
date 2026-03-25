import { useEffect } from 'react';
import { useGetDeliveryTrackingQuery } from '../api/endpoints/deliveryApi';

interface UseDeliveryTrackingProps {
  orderId: string;
  orderStatus?: string;
  enabled?: boolean;
  pollInterval?: number; // in milliseconds
}

/**
 * Hook to auto-poll delivery tracking information when order status is "HandedOverToDelivery"
 * Continues polling through "Delivering" status
 */
export function useDeliveryTracking({
  orderId,
  orderStatus,
  enabled = true,
  pollInterval = 5000, // default 5 seconds
}: UseDeliveryTrackingProps) {
  const shouldPoll =
    enabled &&
    orderId &&
    orderStatus &&
    ['HandedOverToDelivery', 'Delivering'].includes(orderStatus);

  const { data, isLoading, error, refetch } = useGetDeliveryTrackingQuery(
    {
      orderId,
      pageNumber: 1,
      pageSize: 10,
    },
    {
      skip: !shouldPoll,
      pollingInterval: shouldPoll ? pollInterval : 0,
    }
  );

  // Refetch when order status changes to monitored statuses
  useEffect(() => {
    if (shouldPoll) {
      refetch();
    }
  }, [orderStatus, orderId, shouldPoll, refetch]);

  return {
    data,
    isLoading,
    error,
    refetch,
    isPolling: shouldPoll,
  };
}
