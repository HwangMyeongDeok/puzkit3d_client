'use client';

import Image from 'next/image';
import { Minus, Plus, X } from 'lucide-react';

type Props = {
  open: boolean;
  productName: string;
  partnerName?: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  estimatedPriceText: string;
  quantity: number;
  submitting?: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function PartnerQuoteConfirmModal({
  open,
  productName,
  partnerName,
  description,
  thumbnailUrl,
  estimatedPriceText,
  quantity,
  submitting = false,
  onDecrease,
  onIncrease,
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Quote Request Review</h2>
            <p className="mt-1 text-sm text-slate-500">
              Review this partner product before sending your request.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="flex flex-col gap-5 md:flex-row">
            <div className="relative h-40 w-full overflow-hidden rounded-2xl border bg-slate-50 md:h-40 md:w-40 md:shrink-0">
              {thumbnailUrl ? (
                <Image
                  src={thumbnailUrl}
                  alt={productName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No image
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold text-slate-900">{productName}</h3>

              {partnerName ? (
                <p className="mt-1 text-sm font-semibold tracking-wide text-slate-500 uppercase">
                  {partnerName}
                </p>
              ) : null}

              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                    Description
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {description?.trim() || 'No description available.'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                    Estimated Price
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-rose-600">{estimatedPriceText}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-slate-50 px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Quantity</p>
                <p className="text-xs text-slate-500">
                  Adjust the requested quantity before confirming.
                </p>
              </div>

              <div className="inline-flex items-center rounded-2xl border bg-white">
                <button
                  type="button"
                  onClick={onDecrease}
                  disabled={quantity <= 1 || submitting}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-l-2xl text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <div className="flex h-11 min-w-[64px] items-center justify-center border-x text-base font-bold text-slate-900">
                  {quantity}
                </div>

                <button
                  type="button"
                  onClick={onIncrease}
                  disabled={submitting}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-r-2xl text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Sending...' : 'Confirm Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
