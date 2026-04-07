'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

import PartnerRequestHistoryCard from '@/components/custom/PartnerRequestHistoryCard';
import { useGetMyPartnerProductRequestsQuery } from '@/lib/api/endpoints/partnerProductRequestApi';

export default function PartnerRequestsPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 8;

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetMyPartnerProductRequestsQuery({
      ascending: false,
      pageNumber,
      pageSize,
    });

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="mb-6">
          <Link
            href="/brands"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to partner products
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <FileText className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  My Request History
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  View all requests you have sent and track quotation responses from manager.
                </p>
              </div>
            </div>

            {isFetching ? (
              <span className="text-sm font-medium text-slate-500">Refreshing...</span>
            ) : null}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <>
              <div className="h-28 animate-pulse rounded-3xl bg-white" />
              <div className="h-28 animate-pulse rounded-3xl bg-white" />
              <div className="h-28 animate-pulse rounded-3xl bg-white" />
            </>
          ) : isError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-600">
              Failed to load your request history.
              <pre className="mt-3 text-xs whitespace-pre-wrap">
                {JSON.stringify(error, null, 2)}
              </pre>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <h2 className="text-lg font-bold text-slate-900">No requests yet</h2>
              <p className="mt-2 text-sm text-slate-500">
                You have not sent any partner product requests.
              </p>

              <Link
                href="/brands"
                className="mt-5 inline-flex rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Browse partner products
              </Link>
            </div>
          ) : (
            <>
              {items.map((request) => (
                <PartnerRequestHistoryCard
                  key={request.id}
                  request={request}
                  onChanged={() => refetch()}
                />
              ))}

              <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Page <span className="font-semibold text-slate-900">{pageNumber}</span> /{' '}
                  <span className="font-semibold text-slate-900">{totalPages}</span>
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                    disabled={pageNumber <= 1}
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() => setPageNumber((prev) => prev + 1)}
                    disabled={pageNumber >= totalPages}
                    className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
