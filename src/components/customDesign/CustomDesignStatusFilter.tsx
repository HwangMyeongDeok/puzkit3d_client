'use client';

import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import type { CustomDesignRequestStatus } from '@/types/api/customDesign.api.type';
import { CUSTOM_DESIGN_STATUS_MAP } from './CustomDesignStatusBadge';

const STATUS_OPTIONS = (
  Object.entries(CUSTOM_DESIGN_STATUS_MAP) as [CustomDesignRequestStatus, { label: string }][]
).map(([key, info]) => ({
  value: key,
  label: info.label,
}));

interface CustomDesignStatusFilterProps {
  selectedStatus: CustomDesignRequestStatus | '';
  onChange: (status: CustomDesignRequestStatus | '') => void;
  counts?: Partial<Record<CustomDesignRequestStatus | 'all', number>>;
}

export default function CustomDesignStatusFilter({
  selectedStatus,
  onChange,
  counts,
}: CustomDesignStatusFilterProps) {
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
        All Requests
        {counts?.all != null && (
          <span className="ml-1.5 rounded-full bg-white/20 px-1.5 text-[10px] font-bold">
            {counts.all}
          </span>
        )}
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
          {counts?.[opt.value] != null && counts[opt.value]! > 0 && (
            <span className="ml-1.5 rounded-full bg-white/20 px-1.5 text-[10px] font-bold">
              {counts[opt.value]}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
}
