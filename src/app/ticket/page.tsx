'use client';

// src/app/account/tickets/page.tsx

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Loader2,
  Ticket,
  CheckCircle2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
  Calendar,
  Hash,
  Link as LinkIcon,
  FileText,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import {
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useUpdateTicketStatusMutation,
  useDeleteTicketMutation,
  type SupportTicketDto,
  type TicketStatus,
} from '@/lib/api/endpoints/supportTicketApi';

/* ------------------------------------------------------------------ */
/*  Constants & helpers                                                */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 8;

const TICKET_TYPE_LABEL: Record<string, string> = {
  ReplacePart: 'Replace Part',
  Exchange: 'Exchange',
  Return: 'Return',
};

const STATUS_CONFIG: Record<TicketStatus, { label: string; className: string }> = {
  Open: { label: 'Open', className: 'border-blue-500/30   bg-blue-500/10   text-blue-600' },
  Processing: {
    label: 'Processing',
    className: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-600',
  },
  Resolved: {
    label: 'Resolved',
    className: 'border-green-500/30  bg-green-500/10  text-green-600',
  },
  Rejected: { label: 'Rejected', className: 'border-red-500/30    bg-red-500/10    text-red-600' },
};

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'Open', label: 'Open' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'Rejected', label: 'Rejected' },
];

function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return null;
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wider uppercase ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Detail Sheet                                                       */
/* ------------------------------------------------------------------ */

function TicketDetailSheet({
  ticketId,
  open,
  onOpenChange,
}: {
  ticketId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data: ticket, isLoading } = useGetTicketByIdQuery(ticketId!, {
    skip: !ticketId || !open,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <Ticket className="text-brand h-5 w-5" />
            Support Ticket Details
          </SheetTitle>
          <SheetDescription>Full information regarding your support ticket.</SheetDescription>
        </SheetHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-brand h-8 w-8 animate-spin" />
          </div>
        )}

        {ticket && (
          <div className="flex flex-col gap-5 text-sm">
            {/* Status + Type */}
            <div className="bg-muted/30 border-border/50 flex items-center justify-between rounded-lg border p-4">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs tracking-wider uppercase">
                  Request Type
                </span>
                <span className="font-semibold">
                  {TICKET_TYPE_LABEL[ticket.type] ?? ticket.type}
                </span>
              </div>
              <TicketStatusBadge status={ticket.status} />
            </div>

            {/* Meta */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Hash className="text-muted-foreground h-4 w-4 shrink-0" />
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono text-xs">{ticket.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="text-muted-foreground h-4 w-4 shrink-0" />
                <span className="text-muted-foreground">Created Date:</span>
                <span>
                  {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <Separator />

            {/* Reason */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 font-semibold">
                <FileText className="text-brand h-4 w-4" />
                Reason
              </div>
              <p className="text-muted-foreground bg-muted/20 rounded-md p-3 leading-relaxed">
                {ticket.reason}
              </p>
            </div>

            {/* Proof */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 font-semibold">
                <LinkIcon className="text-brand h-4 w-4" />
                Evidence
              </div>
              <a
                href={ticket.proof}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-blue-600 underline underline-offset-2 hover:text-blue-700"
              >
                {ticket.proof}
              </a>
            </div>

            <Separator />

            {/* Items */}
            {ticket.details && ticket.details.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 font-semibold">
                  <Package className="text-brand h-4 w-4" />
                  Related Products ({ticket.details.length})
                </div>
                <div className="flex flex-col gap-3">
                  {ticket.details.map((d) => (
                    <div key={d.id} className="bg-muted/20 border-border/50 rounded-lg border p-3">
                      <div className="flex items-start gap-3">
                        {d.thumbnailUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={d.thumbnailUrl}
                            alt={d.productName || ''}
                            className="border-border h-10 w-10 shrink-0 rounded-md border object-cover"
                          />
                        )}
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">{d.productName || d.orderDetailId}</span>
                          {d.variantName && (
                            <span className="text-muted-foreground text-xs">{d.variantName}</span>
                          )}
                          {d.partId && (
                            <span className="text-muted-foreground text-xs">
                              Part: <span className="text-foreground font-medium">{d.partId}</span>
                            </span>
                          )}
                          <span className="text-muted-foreground text-xs">
                            Quantity:{' '}
                            <span className="text-foreground font-medium">{d.quantity}</span>
                          </span>
                          {d.note && (
                            <span className="text-muted-foreground text-xs italic">"{d.note}"</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/*  Ticket Card                                                        */
/* ------------------------------------------------------------------ */

interface TicketCardProps {
  ticket: SupportTicketDto;
  onView: (id: string) => void;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
  isResolving: boolean;
  isDeleting: boolean;
}

function TicketCard({
  ticket,
  onView,
  onResolve,
  onDelete,
  isResolving,
  isDeleting,
}: TicketCardProps) {
  const canDelete = ticket.status === 'Open';
  const canResolve = ticket.status !== 'Resolved' && ticket.status !== 'Rejected';

  return (
    <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <Ticket className="text-brand h-4 w-4 shrink-0" />
            <span className="text-foreground truncate font-semibold">
              {TICKET_TYPE_LABEL[ticket.type] ?? ticket.type}
            </span>
          </div>
          <span className="text-muted-foreground font-mono text-xs">
            #{ticket.id.split('-')[0].toUpperCase()}
          </span>
        </div>
        <TicketStatusBadge status={ticket.status} />
      </div>

      {/* Reason preview */}
      <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">{ticket.reason}</p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(ticket.createdAt).toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </span>

        <div className="flex items-center gap-2">
          {/* View */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-3"
            onClick={() => onView(ticket.id)}
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </Button>

          {/* Mark as Resolved — hard constraint: customers can only set Resolved */}
          {canResolve && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-green-500/40 px-3 text-green-600 hover:bg-green-50"
              onClick={() => onResolve(ticket.id)}
              disabled={isResolving}
            >
              {isResolving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Resolved
            </Button>
          )}

          {/* Delete — only when Open */}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 h-8 px-2"
              onClick={() => onDelete(ticket.id)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function MyTicketsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  /* ---- RTK Query ---- */
  const { data, isLoading, isError, refetch } = useGetTicketsQuery(
    {
      pageNumber: page,
      pageSize: PAGE_SIZE,
      ...(statusFilter !== 'all' && { status: statusFilter }),
    },
    { refetchOnMountOrArgChange: true }
  );

  const [updateStatus, { isLoading: isResolving }] = useUpdateTicketStatusMutation();
  const [deleteTicket, { isLoading: isDeleting }] = useDeleteTicketMutation();

  /* ---- handlers ---- */

  const handleView = (id: string) => {
    setDetailId(id);
    setDetailOpen(true);
  };

  const handleResolve = async (id: string) => {
    try {
      await updateStatus({ id, status: 'Resolved' }).unwrap();
      toast.success('Marked as resolved successfully!');
    } catch {
      toast.error('Unable to update status. Please try again.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTicket(deleteTarget).unwrap();
      toast.success('Support ticket deleted successfully.');
    } catch {
      toast.error('Unable to delete. Please try again.');
    } finally {
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  const totalPages = data?.totalPages ?? 1;

  /* ---------------------------------------------------------------- */
  return (
    <div className="container-custom py-8 lg:py-12">
      <div className="flex flex-col gap-6">
        {/* Page header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">My Support Tickets</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Track and manage all your support tickets.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 self-start sm:self-auto"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-sm font-medium">Filter by:</span>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {data && <span className="text-muted-foreground text-sm">{data.totalCount} tickets</span>}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="text-brand h-10 w-10 animate-spin" />
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <AlertTriangle className="text-destructive h-10 w-10" />
            <p className="font-semibold">Unable to load data</p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && data?.items.length === 0 && (
          <div className="bg-muted/20 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
            <Ticket className="text-muted-foreground/40 h-12 w-12" />
            <p className="font-semibold">No requests yet</p>
            <p className="text-muted-foreground text-sm">
              When you report an issue from the order details page, it will appear here.
            </p>
          </div>
        )}

        {/* Ticket grid */}
        {!isLoading && !isError && data && data.items.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {data.items.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onView={handleView}
                  onResolve={handleResolve}
                  onDelete={(id) => {
                    setDeleteTarget(id);
                    setDeleteOpen(true);
                  }}
                  isResolving={isResolving}
                  isDeleting={isDeleting}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-muted-foreground text-sm">
                  Page <span className="text-foreground font-semibold">{page}</span> / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Sheet */}
      <TicketDetailSheet ticketId={detailId} open={detailOpen} onOpenChange={setDetailOpen} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive h-5 w-5" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this support request? This action cannot be undone.
              Note: You can only delete requests with an <strong>Open</strong> status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
