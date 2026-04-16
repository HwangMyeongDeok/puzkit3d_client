import { getStatusMeta } from '@/lib/utils/order-status';

const colorMap: Record<string, string> = {
  yellow: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-600',
  blue: 'border-blue-500/20 bg-blue-500/10 text-blue-600',
  indigo: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-600',
  violet: 'border-violet-500/20 bg-violet-500/10 text-violet-600',
  emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600',

  green: 'border-green-500/20 bg-green-500/10 text-green-600',
  red: 'border-red-500/20 bg-red-500/10 text-red-600',
  orange: 'border-orange-500/20 bg-orange-500/10 text-orange-600',
  rose: 'border-rose-500/20 bg-rose-500/10 text-rose-600',
  slate: 'border-slate-300 bg-slate-100 text-slate-600',
};

const badgeBase =
  'flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wider uppercase';

export default function OrderBadge({ status }: { status?: string }) {
  const info = getStatusMeta(status);

  if (!info) {
    return (
      <span className={`${badgeBase} border-slate-300 bg-slate-100 text-slate-600`}>
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
        Unknown
      </span>
    );
  }

  const dotColorClass =
    colorMap[info.color]
      ?.split(' ')
      .find((c) => c.startsWith('text-'))
      ?.replace('text-', 'bg-') || 'bg-slate-400';

  return (
    <span className={`${badgeBase} ${colorMap[info.color] ?? colorMap.slate}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColorClass}`}></span>
      {info.label}
    </span>
  );
}