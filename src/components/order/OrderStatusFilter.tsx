import { useRef, MouseEvent } from 'react';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    isDown.current = true;
    if (scrollRef.current) {
      startX.current = e.pageX - scrollRef.current.offsetLeft;
      scrollLeft.current = scrollRef.current.scrollLeft;
    }
  };

  const handleMouseLeave = () => {
    isDown.current = false;
  };

  const handleMouseUp = () => {
    isDown.current = false;
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDown.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <div
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className="scrollbar-hide flex cursor-grab items-center gap-2 overflow-x-auto pb-2 select-none active:cursor-grabbing"
    >
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
