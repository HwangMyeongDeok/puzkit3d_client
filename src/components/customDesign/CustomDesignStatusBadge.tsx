'use client';

import type { CustomDesignRequestStatus } from '@/types/api/customDesign.api.type';

/** Visual config for every custom-design status. */
export const CUSTOM_DESIGN_STATUS_MAP: Record<
  CustomDesignRequestStatus,
  { label: string; color: string; icon: string }
> = {
  Submitted: { label: 'Submitted', color: 'blue', icon: '📩' },
  MissingInformation: { label: 'Missing Info', color: 'orange', icon: '⚠️' },
  Approved: { label: 'Approved', color: 'emerald', icon: '✅' },
  Processing: { label: 'Processing', color: 'indigo', icon: '⚙️' },
  Completed: { label: 'Completed', color: 'green', icon: '🎉' },
  Rejected: { label: 'Rejected', color: 'red', icon: '❌' },
  Cancelled: { label: 'Cancelled', color: 'rose', icon: '🚫' },
  Expired: { label: 'Expired', color: 'yellow', icon: '⏰' },
};

const colorMap: Record<string, string> = {
  yellow: 'border-yellow-500/20  bg-yellow-500/10  text-yellow-600  dark:text-yellow-400',
  blue: 'border-blue-500/20    bg-blue-500/10    text-blue-600    dark:text-blue-400',
  indigo: 'border-indigo-500/20  bg-indigo-500/10  text-indigo-600  dark:text-indigo-400',
  emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  green: 'border-green-500/20   bg-green-500/10   text-green-600   dark:text-green-400',
  red: 'border-red-500/20     bg-red-500/10     text-red-600     dark:text-red-400',
  orange: 'border-orange-500/20  bg-orange-500/10  text-orange-600  dark:text-orange-400',
  rose: 'border-rose-500/20    bg-rose-500/10    text-rose-600    dark:text-rose-400',
};

const badgeBase =
  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase transition-colors';

export default function CustomDesignStatusBadge({ status }: { status: CustomDesignRequestStatus }) {
  const info = CUSTOM_DESIGN_STATUS_MAP[status];

  if (!info) {
    return (
      <span className={`${badgeBase} bg-muted text-muted-foreground border-border`}>
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Unknown
      </span>
    );
  }

  const dotColorClass =
    colorMap[info.color]
      ?.split(/\s+/)
      .find((c) => c.startsWith('text-') && !c.startsWith('dark:'))
      ?.replace('text-', 'bg-') || 'bg-slate-400';

  return (
    <span className={`${badgeBase} ${colorMap[info.color] ?? ''}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColorClass}`} />
      {info.label}
    </span>
  );
}
