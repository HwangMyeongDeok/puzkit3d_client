import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { INSTOCK_FILTER_OPTIONS, type FilterOption } from '@/lib/utils/order-status';

interface OrderStatusFilterProps {
  selectedStatus: string;
  onChange: (status: string) => void;
  options?: FilterOption[];
  allLabel?: string;
}

export default function OrderStatusFilter({
  selectedStatus,
  onChange,
  options = INSTOCK_FILTER_OPTIONS,
  allLabel = 'All Orders',
}: OrderStatusFilterProps) {
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
        {allLabel}
      </Button>

      {options.map((opt) => (
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
