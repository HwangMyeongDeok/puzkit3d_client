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

      {/* Nút All Requests */}
      <Button
        variant="outline" // Sử dụng outline làm base, ghi đè class bên dưới
        onClick={() => onChange('')}
        className={`rounded-full px-5 whitespace-nowrap transition-all ${
          selectedStatus === ''
            ? 'border-blue-900 bg-blue-900 text-white hover:bg-blue-800 hover:text-white'
            : 'text-muted-foreground border-border hover:bg-blue-50 hover:text-blue-900'
        }`}
        size="sm"
      >
        All Requests
        {counts?.all != null && (
          <span
            className={`ml-1.5 rounded-full px-1.5 text-[10px] font-bold ${
              selectedStatus === '' ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
            }`}
          >
            {counts.all}
          </span>
        )}
      </Button>

      {/* Các nút Trạng thái */}
      {STATUS_OPTIONS.map((opt) => {
        const isSelected = selectedStatus === opt.value;
        return (
          <Button
            key={opt.value}
            variant="outline"
            onClick={() => onChange(opt.value)}
            className={`rounded-full px-5 whitespace-nowrap transition-all ${
              isSelected
                ? 'border-blue-900 bg-blue-900 text-white hover:bg-blue-800 hover:text-white'
                : 'text-muted-foreground border-border hover:bg-blue-50 hover:text-blue-900'
            }`}
            size="sm"
          >
            {opt.label}
            {counts?.[opt.value] != null && counts[opt.value]! > 0 && (
              <span
                className={`ml-1.5 rounded-full px-1.5 text-[10px] font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                }`}
              >
                {counts[opt.value]}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
