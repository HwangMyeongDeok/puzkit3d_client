'use client';

import { useState } from 'react';
import {
  Ticket,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Package,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Hash,
} from 'lucide-react';

import { useGetTicketsQuery } from '@/lib/api/endpoints/supportTicketApi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SupportTicketDetail {
  id: string;
  orderDetailId: string;
  partId: string | null;
  quantity: number;
  note: string | null;
}

interface SupportTicket {
  id: string;
  code: string;
  userId: string;
  orderId: string;
  type: 'Exchange' | 'Return' | 'Refund' | 'Complaint';
  status: 'Open' | 'Pending' | 'Processing' | 'Resolved' | 'Rejected' | 'Cancelled';
  reason: string;
  proof: string;
  createdAt: string;
  updatedAt: string;
  details: SupportTicketDetail[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  SupportTicket['status'],
  { label: string; icon: typeof Clock; color: string; bg: string; border: string }
> = {
  Open: {
    label: 'Open',
    icon: AlertCircle,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
  },
  Pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  Processing: {
    label: 'Processing',
    icon: RefreshCw,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  Resolved: {
    label: 'Resolved',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  Rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  Cancelled: {
    label: 'Cancelled',
    icon: AlertCircle,
    color: 'text-slate-500',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
  },
};

const TYPE_CONFIG: Record<SupportTicket['type'], { label: string; color: string; bg: string }> = {
  Exchange: { label: 'Exchange', color: 'text-violet-700', bg: 'bg-violet-50' },
  Return: { label: 'Return', color: 'text-orange-700', bg: 'bg-orange-50' },
  Refund: { label: 'Refund', color: 'text-teal-700', bg: 'bg-teal-50' },
  Complaint: { label: 'Complaint', color: 'text-rose-700', bg: 'bg-rose-50' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function parseProofLinks(proof: string): string[] {
  return proof
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function isImageLink(url: string) {
  return /\.(png|jpg|jpeg|gif|webp)$/i.test(url);
}

// ─── Timeline step ────────────────────────────────────────────────────────────

const STEPS: SupportTicket['status'][] = ['Open', 'Processing', 'Resolved'];

function StatusTimeline({ status }: { status: SupportTicket['status'] }) {
  const isFinal = status === 'Rejected' || status === 'Cancelled';
  const activeIndex = STEPS.indexOf(status as (typeof STEPS)[number]);

  if (isFinal) {
    const cfg = STATUS_CONFIG[status];
    const Icon = cfg.icon;
    return (
      <div
        className={`flex items-center gap-2 rounded-lg border px-4 py-3 ${cfg.bg} ${cfg.border}`}
      >
        <Icon className={`h-5 w-5 ${cfg.color}`} />
        <span className={`text-sm font-semibold ${cfg.color}`}>Ticket {cfg.label}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, i) => {
        const done = i <= activeIndex;
        const cfg = STATUS_CONFIG[step];
        const Icon = cfg.icon;
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                done
                  ? `${cfg.bg} ${cfg.color} ${cfg.border}`
                  : 'border-slate-200 bg-slate-50 text-slate-400'
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 ${done && step === 'Processing' ? 'animate-spin' : ''}`}
              />
              {cfg.label}
            </div>
            {i < STEPS.length - 1 && (
              <ArrowRight
                className={`h-3.5 w-3.5 shrink-0 ${done && i < activeIndex ? 'text-slate-400' : 'text-slate-200'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Single ticket card ────────────────────────────────────────────────────────

function TicketCard({ ticket }: { ticket: SupportTicket }) {
  const [expanded, setExpanded] = useState(false);
  const typeCfg = TYPE_CONFIG[ticket.type] ?? {
    label: ticket.type,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
  };
  const proofLinks = parseProofLinks(ticket.proof);

  return (
    <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex flex-col gap-4 p-5">
        {/* Top row */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-card-foreground text-sm font-semibold">#{ticket.code}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeCfg.bg} ${typeCfg.color}`}
                >
                  {typeCfg.label}
                </span>
              </div>
              <div className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
                <Hash className="h-3 w-3" />
                <span className="font-mono">{ticket.id.slice(0, 8)}…</span>
              </div>
            </div>
          </div>

          <div className="text-muted-foreground text-right text-xs">
            <div>Created {formatDate(ticket.createdAt)}</div>
            <div className="mt-0.5">Updated {formatDate(ticket.updatedAt)}</div>
          </div>
        </div>

        {/* Timeline */}
        <div className="overflow-x-auto">
          <StatusTimeline status={ticket.status} />
        </div>

        {/* Reason */}
        <div className="bg-muted/40 rounded-xl p-3">
          <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
            Reason
          </p>
          <p className="text-card-foreground text-sm leading-relaxed">{ticket.reason}</p>
        </div>

        {/* Order ID */}
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <Package className="h-3.5 w-3.5" />
          <span>Order:</span>
          <span className="text-card-foreground font-mono">{ticket.orderId}</span>
        </div>
      </div>

      {/* Expandable details */}
      <div className="border-border border-t">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="hover:bg-muted/50 flex w-full items-center justify-between px-5 py-3 text-sm font-medium transition-colors"
        >
          <span className="text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Proof & details ({ticket.details.length} item
            {ticket.details.length !== 1 ? 's' : ''})
          </span>
          {expanded ? (
            <ChevronUp className="text-muted-foreground h-4 w-4" />
          ) : (
            <ChevronDown className="text-muted-foreground h-4 w-4" />
          )}
        </button>

        {expanded && (
          <div className="border-border space-y-4 border-t px-5 pt-4 pb-5">
            {/* Proof */}
            {proofLinks.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                  Proof files
                </p>
                <div className="flex flex-wrap gap-2">
                  {proofLinks.map((link, i) => {
                    const isImg = isImageLink(link);
                    const isUrl = link.startsWith('http');
                    return isUrl ? (
                      <a
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-muted hover:bg-muted/70 text-card-foreground flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {isImg ? 'View image' : 'Open link'}
                      </a>
                    ) : (
                      <span
                        key={i}
                        className="bg-muted text-muted-foreground rounded-lg px-3 py-1.5 font-mono text-xs"
                      >
                        {link.split('/').pop()}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Item details */}
            {ticket.details.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                  Items
                </p>
                <div className="space-y-2">
                  {ticket.details.map((d) => (
                    <div
                      key={d.id}
                      className="border-border bg-muted/30 flex items-center justify-between rounded-xl border px-4 py-3"
                    >
                      <div className="space-y-0.5">
                        <p className="text-card-foreground font-mono text-xs font-medium">
                          {d.orderDetailId.slice(0, 8)}…
                        </p>
                        {d.note && <p className="text-muted-foreground text-xs">{d.note}</p>}
                      </div>
                      <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
                        ×{d.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function TicketSkeleton() {
  return (
    <div className="bg-card border-border animate-pulse space-y-4 rounded-2xl border p-5">
      <div className="flex items-center gap-3">
        <div className="bg-muted h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <div className="bg-muted h-4 w-24 rounded" />
          <div className="bg-muted h-3 w-16 rounded" />
        </div>
      </div>
      <div className="bg-muted h-8 w-full rounded-lg" />
      <div className="bg-muted h-16 w-full rounded-xl" />
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
        <Ticket className="text-muted-foreground h-8 w-8" />
      </div>
      <h3 className="text-card-foreground mb-1 font-semibold">No support tickets</h3>
      <p className="text-muted-foreground text-sm">
        You haven't submitted any support requests yet.
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SupportTicketsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isFetching, isError, refetch } = useGetTicketsQuery({
    pageNumber: page,
    pageSize,
  });

  const tickets: SupportTicket[] = data?.items ?? [];
  const totalPages: number = data?.totalPages ?? 1;

  return (
    <div className="container-custom py-8 lg:py-12">
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-card-foreground text-2xl font-bold tracking-tight">
              Support Tickets
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Track your exchange, return and complaint requests.
              {data?.totalCount ? ` (${data.totalCount} total)` : ''}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="hover:bg-muted border-border flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats row */}
        {!isLoading && tickets.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(['Open', 'Processing', 'Resolved', 'Rejected'] as const).map((s) => {
              const count = tickets.filter((t) => t.status === s).length;
              const cfg = STATUS_CONFIG[s];
              const Icon = cfg.icon;
              return (
                <div key={s} className={`rounded-xl border px-4 py-3 ${cfg.bg} ${cfg.border}`}>
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${cfg.color}`} />
                    <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <p className={`mt-1 text-2xl font-bold ${cfg.color}`}>{count}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            <TicketSkeleton />
            <TicketSkeleton />
          </div>
        ) : isError ? (
          <div className="bg-destructive/10 border-destructive/20 text-destructive flex items-center gap-3 rounded-xl border p-4 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            Failed to load your support tickets. Please try again.
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!data?.hasPreviousPage || isFetching}
                  className="border-border hover:bg-muted rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-muted-foreground text-sm">
                  Page {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data?.hasNextPage || isFetching}
                  className="border-border hover:bg-muted rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
