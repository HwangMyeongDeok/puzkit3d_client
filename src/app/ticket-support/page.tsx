'use client';

import { useState } from 'react';
import { Ticket, AlertCircle, RefreshCw } from 'lucide-react';

import { useGetTicketsQuery, type SupportTicketDto } from '@/lib/api/endpoints/supportTicketApi';

import SupportTicketCard from '@/components/ticket/SupportTicketCard';

function TicketSkeleton() {
  return (
    <div className="bg-card border-border mb-4 flex animate-pulse flex-col gap-5 rounded-2xl border p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-muted h-7 w-40 rounded-md" />
            <div className="bg-muted h-6 w-24 rounded-full" />
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-muted h-4 w-32 rounded" />
            <div className="bg-muted h-4 w-28 rounded" />
          </div>
        </div>
        <div className="bg-muted hidden h-9 w-28 rounded-lg sm:block" />
      </div>
      <div className="bg-muted/50 h-20 w-full rounded-xl" />
      <div className="border-border mt-1 flex items-center justify-between border-t pt-4">
        <div className="bg-muted h-4 w-1/3 rounded" />
        <div className="bg-muted h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
}

export default function SupportTicketsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isFetching, isError, refetch } = useGetTicketsQuery({
    pageNumber: page,
    pageSize,
  });

  const tickets: SupportTicketDto[] = data?.items ?? [];
  const totalPages: number = data?.totalPages ?? 1;

  return (
    <div className="container-custom min-h-screen bg-slate-50/30 py-8 lg:py-12 dark:bg-slate-950">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Support Center
            </h1>
            <p className="mt-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
              Track and manage your requests
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-200 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin text-blue-500' : ''}`} />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <TicketSkeleton />
            <TicketSkeleton />
          </div>
        ) : isError ? (
          <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700 shadow-sm dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            Failed to load your support tickets. Please try refreshing.
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800">
              <Ticket className="h-10 w-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              No Support Tickets
            </h3>
            <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
              You haven&apos;t submitted any exchange or replacement requests yet.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <SupportTicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-700">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!data?.hasPreviousPage || isFetching}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Previous
                </button>
                <span className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data?.hasNextPage || isFetching}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
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
