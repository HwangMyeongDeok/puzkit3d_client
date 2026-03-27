import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { ORDER_STATUS_MAP } from '@/constants';
import { InstockOrderStatus } from '@/types/api/order.api.types';

const STATUS_OPTIONS = Object.entries(ORDER_STATUS_MAP).map(([key, info]) => ({
  value: key as InstockOrderStatus,
  label: info.label,
}));

interface OrderStatusFilterProps {
  selectedStatus: InstockOrderStatus | '';
  onChange: (status: InstockOrderStatus | '') => void;
}

export default function OrderStatusFilter({ selectedStatus, onChange }: OrderStatusFilterProps) {
  return (
    <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto pb-2">
      <div className="text-muted-foreground mr-2 hidden items-center gap-2 text-sm font-medium md:flex">
        <Filter className="h-4 w-4" />
        <span>Filter:</span>
      </div>
      <Button
        variant={selectedStatus === '' ? 'default' : 'outline'}
        onClick={() => onChange('')}
        className="rounded-full px-5 whitespace-nowrap transition-all"
        size="sm"
      >
        All Orders
      </Button>
      {STATUS_OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          variant={selectedStatus === opt.value ? 'default' : 'outline'}
          onClick={() => onChange(opt.value)}
          className="rounded-full px-5 whitespace-nowrap transition-all"
          size="sm"
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
