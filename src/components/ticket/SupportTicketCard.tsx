'use client';

import Link from 'next/link';
import { ExternalLink, ArrowRight, Calendar, Hash } from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/format';
import { ROUTES } from '@/constants/routes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import type { SupportTicketDto, TicketType } from '@/lib/api/endpoints/supportTicketApi';

import TicketStepper from './TicketStepper';

// Cấu hình màu cho dễ nhìn
const TICKET_TYPE_CONFIG: Record<TicketType, { label: string; className: string }> = {
  ReplaceDrive: {
    label: 'Replace Drive',
    className:
      'bg-indigo-50/50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
  },
  Exchange: {
    label: 'Exchange',
    className:
      'bg-violet-50/50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20',
  },
  Return: {
    label: 'Return',
    className:
      'bg-amber-50/50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  },
};

interface SupportTicketCardProps {
  ticket: SupportTicketDto;
}

export default function SupportTicketCard({ ticket }: SupportTicketCardProps) {
  const typeConfig = TICKET_TYPE_CONFIG[ticket.type];

  const ticketSteps = [
    'Submitted',
    'Processing',
    ticket.status === 'Rejected' ? 'Rejected' : 'Resolved',
  ];
  const activeStep = ticket.status === 'Open' ? 0 : ticket.status === 'Processing' ? 1 : 2;
  const isRejected = ticket.status === 'Rejected';

  return (
    <article className="bg-card border-border group hover:border-brand/40 relative flex flex-col gap-5 rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:shadow-md sm:p-6">
      {/* ─── HEADER ROW ─── */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-foreground flex items-center gap-1.5 text-xl font-bold tracking-tight">
              <Hash className="text-muted-foreground h-5 w-5" />
              {ticket.code}
            </h3>
            <Badge
              variant="outline"
              className={cn(
                'rounded-lg border px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase',
                typeConfig.className
              )}
            >
              {typeConfig.label}
            </Badge>
          </div>

          <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(ticket.createdAt, true)}
            </span>

            {ticket.orderCode && (
              <span className="border-border flex items-center gap-1.5 border-l pl-4">
                Order #{ticket.orderCode}
              </span>
            )}
          </div>
        </div>

        {/* Nút View Order gốc, giữ lại nếu muốn bay qua Order thay vì Ticket */}
        <Button
          variant="secondary"
          size="sm"
          className="hidden shrink-0 gap-1.5 self-start sm:flex"
          asChild
        >
          <Link href={ROUTES.ORDER_DETAIL(ticket.orderId)}>
            View Order
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* ─── PROGRESS BAR ─── */}
      <div className="bg-muted/30 border-border rounded-xl border p-4">
        <TicketStepper steps={ticketSteps} activeStep={activeStep} isRejected={isRejected} />
      </div>

      {/* ─── FOOTER & ACTION ─── */}
      <div className="border-border mt-1 flex items-center justify-between border-t pt-4">
        <p className="text-muted-foreground line-clamp-1 max-w-[60%] text-sm">
          <span className="text-foreground mr-1 font-semibold">Reason:</span>
          {ticket.reason}
        </p>

        {/* 👉 Nút View Details bay sang trang /support/[id] */}
        <Button className="gap-2 font-semibold shadow-none" asChild>
          <Link href={`/profile/ticket-support/${ticket.id}`}>
            View Details{' '}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
