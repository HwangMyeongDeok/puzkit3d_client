'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Loader2, PenTool, Sparkles, Search, SlidersHorizontal } from 'lucide-react';

import { useGetCustomDesignRequestsQuery } from '@/lib/api/endpoints/customDesignApi';
import CustomDesignStatusFilter from '@/components/customDesign/CustomDesignStatusFilter';
import CustomDesignRequestCard from '@/components/customDesign/CustomDesignRequestCard';
import type { CustomDesignRequestStatus } from '@/types/api/customDesign.api.type';

export default function CustomDesignRequestsPage() {
  const [selectedStatus, setSelectedStatus] = useState<CustomDesignRequestStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError, isFetching } = useGetCustomDesignRequestsQuery();
  const requests = data?.items || [];
  // ── Derived data ──
  const statusCounts = useMemo(() => {
    const counts: Partial<Record<CustomDesignRequestStatus | 'all', number>> = {
      all: requests.length,
    };
    for (const req of requests) {
      counts[req.status] = (counts[req.status] || 0) + 1;
    }
    return counts;
  }, [requests]);

  const filteredRequests = useMemo(() => {
    let result = requests;

    // Status filter
    if (selectedStatus) {
      result = result.filter((r) => r.status === selectedStatus);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.code?.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.customerPrompt?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [requests, selectedStatus, searchQuery]);

  // Sort: actionable first, then newest first
  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      // MissingInformation always on top
      if (a.status === 'MissingInformation' && b.status !== 'MissingInformation') return -1;
      if (b.status === 'MissingInformation' && a.status !== 'MissingInformation') return 1;
      // Then by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredRequests]);

  const handleStatusChange = (status: CustomDesignRequestStatus | '') => {
    setSelectedStatus(status);
  };

  // ── Stats summary ──
  const activeCount = requests.filter((r) =>
    ['Submitted', 'Approved', 'Processing'].includes(r.status)
  ).length;
  const needsAttentionCount = requests.filter((r) => r.status === 'MissingInformation').length;
  const completedCount = requests.filter((r) => r.status === 'Completed').length;

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
          className="bg-brand text-brand-foreground hover:bg-brand/90 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 font-semibold shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <Sparkles className="h-4 w-4" />
          New Request
        </Link>
      </div>

      {/* ── Quick Stats ── */}
      {!isLoading && requests.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="bg-card border-border rounded-xl border p-4 text-center shadow-sm">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Total
            </p>
            <p className="text-foreground text-2xl font-black">{requests.length}</p>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-center shadow-sm dark:border-blue-500/20 dark:bg-blue-500/5">
            <p className="text-[10px] font-semibold tracking-wider text-blue-600 uppercase dark:text-blue-400">
              Active
            </p>
            <p className="text-2xl font-black text-blue-700 dark:text-blue-300">{activeCount}</p>
          </div>
          {needsAttentionCount > 0 && (
            <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 text-center shadow-sm dark:border-orange-500/20 dark:bg-orange-500/5">
              <p className="text-[10px] font-semibold tracking-wider text-orange-600 uppercase dark:text-orange-400">
                Needs Attention
              </p>
              <p className="text-2xl font-black text-orange-700 dark:text-orange-300">
                {needsAttentionCount}
              </p>
            </div>
          )}
          <div className="rounded-xl border border-green-200 bg-green-50/50 p-4 text-center shadow-sm dark:border-green-500/20 dark:bg-green-500/5">
            <p className="text-[10px] font-semibold tracking-wider text-green-600 uppercase dark:text-green-400">
              Completed
            </p>
            <p className="text-2xl font-black text-green-700 dark:text-green-300">
              {completedCount}
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-brand focus:ring-brand/30 w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm transition-colors outline-none focus:ring-1"
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
            <Loader2 className="text-brand h-8 w-8 animate-spin" />
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
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-xl px-8 py-3 font-semibold shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
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
              <Loader2 className="text-brand h-8 w-8 animate-spin" />
            </div>
          )}

          {/* Result count */}
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>
              Showing <strong className="text-foreground">{sortedRequests.length}</strong> of{' '}
              {requests.length} request{requests.length !== 1 ? 's' : ''}
            </span>
          </div>

          {sortedRequests.map((request) => (
            <CustomDesignRequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}
