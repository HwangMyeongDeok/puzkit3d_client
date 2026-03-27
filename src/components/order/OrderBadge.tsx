import { ORDER_STATUS_MAP } from '@/constants';
import { InstockOrderStatus } from '@/types/api/order.api.types';

const colorMap: Record<string, string> = {
  yellow: 'border-yellow-500/20  bg-yellow-500/10  text-yellow-600',
  blue: 'border-blue-500/20    bg-blue-500/10    text-blue-600',
  indigo: 'border-indigo-500/20  bg-indigo-500/10  text-indigo-600',
  violet: 'border-violet-500/20  bg-violet-500/10  text-violet-600',
  emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600',
  green: 'border-green-500/20   bg-green-500/10   text-green-600',
  red: 'bg-destructive/10     text-destructive   border-destructive/20',
  orange: 'border-orange-500/20  bg-orange-500/10  text-orange-600',
  rose: 'border-rose-500/20    bg-rose-500/10    text-rose-600',
};

const badgeBase =
  'rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5';

export default function OrderBadge({ status }: { status?: InstockOrderStatus }) {
  const info = status ? ORDER_STATUS_MAP[status] : undefined;

  if (!info) {
    return (
      <span className={`${badgeBase} bg-muted text-muted-foreground border-border`}>
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span> Unknown
      </span>
    );
  }

  // Lấy màu chấm tròn dựa vào text color
  const dotColorClass =
    colorMap[info.color]
      ?.split(' ')
      .find((c) => c.startsWith('text-'))
      ?.replace('text-', 'bg-') || 'bg-slate-400';

  return (
    <span className={`${badgeBase} ${colorMap[info.color] ?? ''}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColorClass}`}></span>
      {info.label}
    </span>
  );
}
