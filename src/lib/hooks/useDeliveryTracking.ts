import { useEffect } from 'react';
import { useGetDeliveryTrackingQuery } from '../api/endpoints/deliveryApi';

interface UseDeliveryTrackingProps {
  orderId: string;
  orderStatus?: string;
  enabled?: boolean;
}

export function useDeliveryTracking({
  orderId,
  orderStatus,
  enabled = true,
}: UseDeliveryTrackingProps) {
  const trackingEligibleStatuses = [
    'HandedOverToDelivery',
    'Delivering',
    'Delivered',
    'Completed',
    'Returned',
    'Resolved',
  ];

  const shouldFetch =
    enabled && !!orderId && !!orderStatus && trackingEligibleStatuses.includes(orderStatus);

  const { data, isLoading, error, refetch } = useGetDeliveryTrackingQuery(
    {
      orderId,
      pageNumber: 1,
      pageSize: 10,
    },
    {
      skip: !shouldFetch,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  useEffect(() => {
    if (shouldFetch) {
      refetch();
    }
  }, [orderStatus, orderId, shouldFetch, refetch]);

  return {
    data,
    isLoading,
    error,
    refetch,
    isPolling: false,
  };
}
