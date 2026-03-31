import Link from 'next/link';
import { Calendar, Clock, ExternalLink, Info, FileWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

export default function TicketSidebarInfo({ ticket }: { ticket: any }) {
  return (
    <>
      {/* Ticket Meta Information */}
      <div className="bg-card border-border flex flex-col overflow-hidden rounded-xl border shadow-sm">
        <div className="bg-muted/40 border-border flex items-center gap-2 border-b p-4">
          <Info className="text-muted-foreground h-4 w-4" />
          <h3 className="text-foreground font-semibold">Ticket Information</h3>
        </div>
        <div className="space-y-4 p-5 text-sm">
          <div>
            <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
              Created At
            </p>
            <p className="flex items-center gap-2 font-medium">
              <Calendar className="text-muted-foreground h-4 w-4" />
              {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
              Last Updated
            </p>
            <p className="flex items-center gap-2 font-medium">
              <Clock className="text-muted-foreground h-4 w-4" />
              {new Date(ticket.updatedAt).toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="border-border mt-4 border-t pt-4">
            <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
              Associated Order
            </p>
            {ticket.orderCode && (
              <p className="text-primary mb-3 text-lg font-bold">#{ticket.orderCode}</p>
            )}
            <Button variant="outline" className="w-full gap-2 shadow-sm" asChild>
              <Link href={ROUTES.ORDER_DETAIL(ticket.orderId)}>
                View Original Order <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Customer Reason */}
      <div className="bg-card border-border flex flex-col rounded-xl border p-5 shadow-sm">
        <h3 className="text-muted-foreground mb-3 flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
          <FileWarning className="h-4 w-4" /> Customer Reason
        </h3>
        <div className="bg-muted/30 text-foreground border-border/50 rounded-lg border p-3 text-sm leading-relaxed italic">
          "{ticket.reason}"
        </div>
      </div>
    </>
  );
}
