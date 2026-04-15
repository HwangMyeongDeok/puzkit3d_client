import { Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import TicketStepper from '@/components/ticket/TicketStepper';
import type { TicketType } from '@/lib/api/endpoints/supportTicketApi';

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

export default function TicketStatusCard({ ticket }: { ticket: any }) {
  const typeConfig = TICKET_TYPE_CONFIG[ticket.type as TicketType] || {
    label: ticket.type,
    className: 'bg-gray-100 text-gray-700',
  };
  const ticketSteps = [
    'Submitted',
    'Processing',
    ticket.status === 'Rejected' ? 'Rejected' : 'Resolved',
  ];
  const activeStep = ticket.status === 'Open' ? 0 : ticket.status === 'Processing' ? 1 : 2;
  const isRejected = ticket.status === 'Rejected';

  return (
    <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Ticket Code
          </p>
          <p className="text-foreground mt-1 flex items-center gap-1.5 text-2xl font-bold uppercase">
            <Hash className="text-muted-foreground h-5 w-5" />
            {ticket.code}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <Badge
            variant="outline"
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-bold uppercase',
              typeConfig.className
            )}
          >
            {typeConfig.label}
          </Badge>
          <Badge
            variant={ticket.status === 'Rejected' ? 'destructive' : 'default'}
            className="mt-1"
          >
            {ticket.status}
          </Badge>
        </div>
      </div>
      <div className="border-border mt-4 border-t pt-6">
        <TicketStepper steps={ticketSteps} activeStep={activeStep} isRejected={isRejected} />
      </div>
    </div>
  );
}
