'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Loader2,
  PenTool,
  Sparkles,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { useGetCustomDesignRequestsQuery } from '@/lib/api/endpoints/customDesignApi';
import CustomDesignStatusFilter from '@/components/customDesign/CustomDesignStatusFilter';
import CustomDesignRequestCard from '@/components/customDesign/CustomDesignRequestCard';
import type { CustomDesignRequestStatus } from '@/types/api/customDesign.api.type';

const PAGE_SIZE = 10;

export default function CustomDesignRequestsPage() {
  const [selectedStatus, setSelectedStatus] = useState<CustomDesignRequestStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageNumber, setPageNumber] = useState(1);

  const { data, isLoading, isError, isFetching } = useGetCustomDesignRequestsQuery({
    pageNumber,
    pageSize: PAGE_SIZE,
    status: selectedStatus || undefined,
  });

  const requests = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 1;
  const hasPreviousPage = data?.hasPreviousPage ?? false;
  const hasNextPage = data?.hasNextPage ?? false;

  // ── Stats summary (từ toàn bộ data của page hiện tại) ──
  const statusCounts = useMemo(() => {
    const counts: Partial<Record<CustomDesignRequestStatus | 'all', number>> = {
      all: totalCount,
    };
    for (const req of requests) {
      counts[req.status] = (counts[req.status] || 0) + 1;
    }
    return counts;
  }, [requests, totalCount]);

  // Search filter (client-side trên page hiện tại)
  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return requests;
    const q = searchQuery.toLowerCase();
    return requests.filter(
      (r) =>
        r.code?.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.customerPrompt?.toLowerCase().includes(q)
    );
  }, [requests, searchQuery]);

  // Sort: MissingInformation lên đầu
  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      if (a.status === 'MissingInformation' && b.status !== 'MissingInformation') return -1;
      if (b.status === 'MissingInformation' && a.status !== 'MissingInformation') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredRequests]);

  const handleStatusChange = (status: CustomDesignRequestStatus | '') => {
    setSelectedStatus(status);
    setPageNumber(1); // reset về trang 1 khi đổi filter
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setPageNumber(1);
  };

  // ── Thống kê theo yêu cầu mới ──
  const submittedCount = requests.filter((r) => r.status === 'Submitted').length;
  const missingInfoCount = requests.filter((r) => r.status === 'MissingInformation').length;
  const approvedCount = requests.filter((r) => r.status === 'Approved').length;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Custom Design Requests</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Track and manage all your custom design requests in one place.
          </p>
        </div>
        <Link
          href="/custom-service"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-900 px-6 py-2.5 font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-lg"
        >
          <Sparkles className="h-4 w-4" />
          New Request
        </Link>
      </div>

      {/* ── Quick Stats ── */}
      {!isLoading && totalCount > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Card Total (Trung tính) */}
          <div className="bg-card border-border rounded-xl border p-4 text-center shadow-sm">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Total
            </p>
            <p className="text-foreground text-2xl font-black">{totalCount}</p>
          </div>

          {/* Card Submitted (Xanh lam) */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-center shadow-sm dark:border-blue-500/20 dark:bg-blue-500/5">
            <p className="text-[10px] font-semibold tracking-wider text-blue-600 uppercase dark:text-blue-400">
              Submitted
            </p>
            <p className="text-2xl font-black text-blue-700 dark:text-blue-300">{submittedCount}</p>
          </div>

          {/* Card Missing Information (Cam) */}
          <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 text-center shadow-sm dark:border-orange-500/20 dark:bg-orange-500/5">
            <p className="text-[10px] font-semibold tracking-wider text-orange-600 uppercase dark:text-orange-400">
              Missing Info
            </p>
            <p className="text-2xl font-black text-orange-700 dark:text-orange-300">
              {missingInfoCount}
            </p>
          </div>

          {/* Card Completed (Xanh lá) */}
          <div className="rounded-xl border border-green-200 bg-green-50/50 p-4 text-center shadow-sm dark:border-green-500/20 dark:bg-green-500/5">
            <p className="text-[10px] font-semibold tracking-wider text-green-600 uppercase dark:text-green-400">
              Approved
            </p>
            <p className="text-2xl font-black text-green-700 dark:text-green-300">
              {approvedCount}
            </p>
          </div>
        </div>
      )}

      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by request code or description..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="bg-card border-border text-foreground placeholder:text-muted-foreground w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm transition-colors outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900/30"
          />
        </div>
        <CustomDesignStatusFilter
          selectedStatus={selectedStatus}
          onChange={handleStatusChange}
          counts={statusCounts}
        />
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
            <p className="text-muted-foreground text-sm">Loading your requests...</p>
          </div>
        </div>
      ) : isError ? (
        <div className="bg-destructive/10 text-destructive border-destructive/20 rounded-xl border p-6 text-center shadow-sm">
          <p className="font-medium">
            An error occurred while loading your custom design requests.
          </p>
          <p className="mt-1 text-sm opacity-80">Please try refreshing the page.</p>
        </div>
      ) : sortedRequests.length === 0 ? (
        <div className="border-border dark:bg-card flex flex-col items-center justify-center rounded-xl border bg-white py-20 text-center shadow-sm">
          <PenTool className="text-muted-foreground/30 mb-5 h-20 w-20" />
          <h2 className="dark:text-foreground mb-2 text-xl font-bold text-slate-700">
            {selectedStatus || searchQuery
              ? 'No requests match your filters'
              : 'No custom design requests yet'}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            {selectedStatus || searchQuery
              ? 'Try adjusting your filters or search query to see more results.'
              : 'Start by creating a custom design request, and our team will bring your vision to life.'}
          </p>
          {!selectedStatus && !searchQuery && (
            <Link
              href="/custom-service"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-8 py-3 font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-lg"
            >
              <Sparkles className="h-5 w-5" />
              Create Your First Request
            </Link>
          )}
        </div>
      ) : (
        <div className="relative flex flex-col gap-5">
          {isFetching && !isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/50 backdrop-blur-[1px] dark:bg-black/20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
            </div>
          )}

          {/* Result count */}
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>
              Showing <strong className="text-foreground">{sortedRequests.length}</strong> of{' '}
              <strong className="text-foreground">{totalCount}</strong> request
              {totalCount !== 1 ? 's' : ''}
            </span>
          </div>

          {sortedRequests.map((request) => (
            <CustomDesignRequestCard key={request.id} request={request} />
          ))}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-muted-foreground text-sm">
                Page <strong className="text-foreground">{pageNumber}</strong> of{' '}
                <strong className="text-foreground">{totalPages}</strong>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPageNumber((p) => p - 1)}
                  disabled={!hasPreviousPage || isFetching}
                  className="border-border hover:bg-muted disabled:text-muted-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - pageNumber) <= 1)
                  .reduce<(number | '...')[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} className="text-muted-foreground px-1 text-sm">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPageNumber(p as number)}
                        disabled={isFetching}
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                          p === pageNumber
                            ? 'border-blue-900 bg-blue-900 text-white'
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setPageNumber((p) => p + 1)}
                  disabled={!hasNextPage || isFetching}
                  className="border-border hover:bg-muted disabled:text-muted-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
