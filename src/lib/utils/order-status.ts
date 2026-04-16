import type { InstockOrderStatus } from '@/types/api/order.api.types';
import type { DeliveryTracking } from '@/types/api/delivery.api.types';
import type {
  PartnerOrderDisplayStatus,
  PartnerOrderStatus,
} from '@/types/api/partner-order.api.types';

export type BadgeColor =
  | 'yellow'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'emerald'
  | 'green'
  | 'red'
  | 'orange'
  | 'rose'
  | 'slate';

export type FilterOption = {
  value: string;
  label: string;
};

type StatusMeta = {
  label: string;
  color: BadgeColor;
};

export const INSTOCK_STATUS_META: Record<InstockOrderStatus, StatusMeta> = {
  Pending: { label: 'Pending', color: 'yellow' },
  Paid: { label: 'Paid', color: 'blue' },
  Processing: { label: 'Processing', color: 'indigo' },
  Waiting: { label: 'Waiting', color: 'yellow' },
  HandedOverToDelivery: { label: 'Handed Over', color: 'violet' },
  Delivering: { label: 'Delivering', color: 'emerald' },
  Delivered: { label: 'Delivered', color: 'green' },
  Completed: { label: 'Completed', color: 'green' },
  Cancelled: { label: 'Cancelled', color: 'red' },
  Returned: { label: 'Returned', color: 'orange' },
  Rejected: { label: 'Rejected', color: 'rose' },
};

export const PARTNER_STATUS_META: Record<PartnerOrderDisplayStatus, StatusMeta> = {
  Pending: { label: 'Pending', color: 'yellow' },
  Paid: { label: 'Paid', color: 'blue' },
  WatingForReorder: { label: 'Waiting Reorder', color: 'orange' },
  OrderedFromPartner: { label: 'Ordered From Partner', color: 'indigo' },
  ReceivedAtWarehouse: { label: 'Received At Warehouse', color: 'violet' },
  CheckingFailed: { label: 'Checking Failed', color: 'red' },
  Processing: { label: 'Processing', color: 'indigo' },
  HandedOverToDelivery: { label: 'Handed Over', color: 'violet' },
  Delivering: { label: 'Delivering', color: 'emerald' },
  Delivered: { label: 'Delivered', color: 'green' },
  Completed: { label: 'Completed', color: 'green' },
  Expired: { label: 'Expired', color: 'red' },
  CancelledByCustomer: { label: 'Cancelled By Customer', color: 'red' },
  CancelledByStaff: { label: 'Cancelled By Staff', color: 'red' },
  Returned: { label: 'Returned', color: 'orange' },
};

export const INSTOCK_FILTER_OPTIONS: FilterOption[] = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Waiting', label: 'Waiting' },
  { value: 'HandedOverToDelivery', label: 'Handed Over' },
  { value: 'Delivering', label: 'Delivering' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Returned', label: 'Returned' },
  { value: 'Rejected', label: 'Rejected' },
];

export const PARTNER_FILTER_OPTIONS: FilterOption[] = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Paid', label: 'Paid' },
  { value: 'WatingForReorder', label: 'Waiting Reorder' },
  { value: 'OrderedFromPartner', label: 'Ordered From Partner' },
  { value: 'ReceivedAtWarehouse', label: 'Received At Warehouse' },
  { value: 'CheckingFailed', label: 'Checking Failed' },
  { value: 'Processing', label: 'Processing' },
  { value: 'HandedOverToDelivery', label: 'Handed Over' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Expired', label: 'Expired' },
  { value: 'CancelledByCustomer', label: 'Cancelled By Customer' },
  { value: 'CancelledByStaff', label: 'Cancelled By Staff' },
  { value: 'Returned', label: 'Returned' },
];

export const DEFAULT_INSTOCK_STEPS = [
  'Pending',
  'Paid',
  'Processing',
  'Handed Over',
  'Delivering',
  'Delivered',
  'Completed',
] as const;

export function getStatusMeta(status?: string): StatusMeta | undefined {
  if (!status) return undefined;

  if (status in INSTOCK_STATUS_META) {
    return INSTOCK_STATUS_META[status as InstockOrderStatus];
  }

  if (status in PARTNER_STATUS_META) {
    return PARTNER_STATUS_META[status as PartnerOrderDisplayStatus];
  }

  return {
    label: status,
    color: 'slate',
  };
}

function sortTrackings(trackings?: DeliveryTracking[]): DeliveryTracking[] {
  if (!trackings?.length) return [];
  return [...trackings].sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}

export function getOriginalOrLatestTrackings(trackings?: DeliveryTracking[]): DeliveryTracking[] {
  const sorted = sortTrackings(trackings);
  const originals = sorted.filter((t) => (t.type || '').toLowerCase() === 'original');
  return originals.length > 0 ? originals : sorted;
}

export function getPartnerDisplayStatus(
  orderStatus?: string,
  trackingData?: DeliveryTracking[]
): PartnerOrderDisplayStatus | string | undefined {
  if (!orderStatus) return orderStatus;

  if (
    [
      'Completed',
      'Expired',
      'CancelledByCustomer',
      'CancelledByStaff',
      'Returned',
      'CheckingFailed',
    ].includes(orderStatus)
  ) {
    return orderStatus;
  }

  const latestTracking = getOriginalOrLatestTrackings(trackingData)[0];
  if (!latestTracking) return orderStatus;

  const lower = (latestTracking.status || '').toLowerCase();

  if (lower.includes('return')) return 'Returned';
  if (lower.includes('delivered') && !lower.includes('fail')) return 'Delivered';

  if (
    orderStatus === 'HandedOverToDelivery' ||
    lower.includes('deliver') ||
    lower.includes('transport') ||
    lower.includes('shipping') ||
    lower.includes('pick') ||
    lower.includes('store') ||
    lower.includes('ready')
  ) {
    return 'Delivering';
  }

  return orderStatus;
}

const PARTNER_STEP_LABEL_MAP: Record<string, string> = {
  Pending: 'Pending',
  Paid: 'Paid',
  WatingForReorder: 'Waiting Reorder',
  OrderedFromPartner: 'Ordered From Partner',
  ReceivedAtWarehouse: 'Received At Warehouse',
  CheckingFailed: 'Checking Failed',
  Processing: 'Processing',
  HandedOverToDelivery: 'Handed Over',
  Delivering: 'Delivering',
  Delivered: 'Delivered',
  Completed: 'Completed',
  Expired: 'Expired',
  CancelledByCustomer: 'Cancelled By Customer',
  CancelledByStaff: 'Cancelled By Staff',
  Returned: 'Returned',
};

export function getPartnerStepperConfig(status?: string) {
  const baseSteps = [
    'Pending',
    'Paid',
    'Ordered From Partner',
    'Received At Warehouse',
    'Processing',
    'Handed Over',
    'Delivering',
    'Delivered',
    'Completed',
  ];

  if (!status) {
    return {
      steps: baseSteps,
      activeStep: -1,
      isCancelled: false,
      isReturned: false,
    };
  }

  const label = PARTNER_STEP_LABEL_MAP[status] || status;
  const steps = [...baseSteps];
  let isCancelled = false;
  let isReturned = false;

  if (status === 'WatingForReorder') {
    steps.splice(2, 0, label);
    return { steps, activeStep: 2, isCancelled, isReturned };
  }

  if (status === 'CheckingFailed') {
    steps.splice(4, 0, label);
    return { steps, activeStep: 4, isCancelled, isReturned };
  }

  if (status === 'CancelledByCustomer') {
    steps.splice(1, 0, label);
    isCancelled = true;
    return { steps, activeStep: 1, isCancelled, isReturned };
  }

  if (status === 'CancelledByStaff') {
    steps.splice(5, 0, label);
    isCancelled = true;
    return { steps, activeStep: 5, isCancelled, isReturned };
  }

  if (status === 'Expired') {
    steps.splice(1, 0, label);
    isCancelled = true;
    return { steps, activeStep: 1, isCancelled, isReturned };
  }

  if (status === 'Returned') {
    steps.splice(8, 0, label);
    isReturned = true;
    return { steps, activeStep: 8, isCancelled, isReturned };
  }

  return {
    steps,
    activeStep: Math.max(0, steps.indexOf(label)),
    isCancelled,
    isReturned,
  };
}

export const PARTNER_TERMINAL_STATUSES: string[] = [
  'Completed',
  'Expired',
  'CancelledByCustomer',
  'CancelledByStaff',
  'Returned',
];
