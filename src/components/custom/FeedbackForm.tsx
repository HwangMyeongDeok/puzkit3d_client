'use client';

import { useState } from 'react';
import {
  useCreateFeedbackMutation,
  useGetOrderFeedbacksQuery,
  useGetOrderDetailFeedbackQuery,
} from '@/lib/api/endpoints/feedbackApi';
import type { OrderDetailDto } from '@/types/api/order.api.types';
import { toast } from 'sonner';
import { Loader2, Star, Send, CheckCircle2, ChevronUp, Sparkles, PenLine } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

/* ─────────────────────────────────────────────────────────── */
/*  Star Rating                                                */
/* ─────────────────────────────────────────────────────────── */

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? value;

  const colorClass =
    active <= 2
      ? 'fill-red-400 text-red-400'
      : active === 3
        ? 'fill-yellow-400 text-yellow-400'
        : active === 4
          ? 'fill-lime-500 text-lime-500'
          : 'fill-emerald-500 text-emerald-500';

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            onMouseEnter={() => setHovered(v)}
            onMouseLeave={() => setHovered(null)}
            className="transition-transform duration-100 hover:scale-125 active:scale-110"
          >
            <Star
              className={`h-7 w-7 transition-all duration-100 ${
                active >= v ? colorClass : 'text-slate-200'
              }`}
            />
          </button>
        ))}
      </div>
      <span
        className={`text-sm font-bold transition-all duration-150 ${
          active <= 2
            ? 'text-red-400'
            : active === 3
              ? 'text-yellow-500'
              : active === 4
                ? 'text-lime-500'
                : 'text-emerald-500'
        }`}
      >
        {LABELS[active]}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Star display (read-only)                                   */
/* ─────────────────────────────────────────────────────────── */

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((v) => (
        <Star
          key={v}
          className={`h-3.5 w-3.5 ${
            rating >= v ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Single product card                                        */
/* ─────────────────────────────────────────────────────────── */

function ProductReviewCard({ orderId, detail }: { orderId: string; detail: OrderDetailDto }) {
  // ✅ Mỗi card tự fetch feedback của chính nó theo orderDetailId
  const { data, isLoading: isFeedbackLoading } = useGetOrderDetailFeedbackQuery(detail.id);

  // Safely normalize to array
  const feedbackList = Array.isArray(data) ? data : data ? [data] : [];

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [createFeedback, { isLoading }] = useCreateFeedbackMutation();

  // ✅ Có data = đã review (chỉ được review 1 lần)
  const feedback = feedbackList[0];
  const reviewed = !!feedback;
  const canSubmit = comment.trim().length >= 10;

  const handleSubmit = async () => {
    try {
      await createFeedback({
        orderId,
        orderDetailId: detail.id,
        rating,
        comment: comment.trim(),
      }).unwrap();
      toast.success('Review submitted! 🎉', {
        description: 'Thank you for your honest feedback.',
      });
      setOpen(false);
      setComment('');
      setRating(5);
    } catch {
      toast.error('Could not submit', {
        description: 'Please try again in a moment.',
      });
    }
  };

  /* ── Loading skeleton ── */
  if (isFeedbackLoading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-slate-100" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  /* ── Reviewed state ── */
  if (reviewed) {
    return (
      <div className="group relative overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/80 to-teal-50/40 p-4 transition-shadow duration-200 hover:shadow-sm">
        <div className="flex items-start gap-3">
          {/* Thumbnail */}
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-emerald-100 shadow-sm">
            {detail.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={detail.thumbnailUrl}
                alt={detail.productName || ''}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-xl">
                🛍️
              </div>
            )}
            {/* Checkmark overlay */}
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-emerald-600/20">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 drop-shadow" />
            </div>
          </div>

          {/* Info + review */}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="truncate text-sm font-bold text-slate-800">
                  {detail.productName || detail.sku}
                </p>
                {detail.variantName && (
                  <p className="text-xs text-slate-500">Variant: {detail.variantName}</p>
                )}
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                Reviewed
              </span>
            </div>

            {/* Stars + comment */}
            {feedback && <StarDisplay rating={feedback.rating} />}
            {feedback?.comment && (
              <p className="rounded-lg border border-emerald-100 bg-white/60 px-3 py-2 text-xs leading-relaxed text-slate-600 italic">
                &ldquo;{feedback.comment}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Not reviewed ── */
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        open
          ? 'border-violet-200 bg-gradient-to-br from-violet-50/60 to-indigo-50/40 shadow-lg shadow-violet-100/50'
          : 'cursor-pointer border-slate-200 bg-white hover:border-violet-200 hover:shadow-md hover:shadow-violet-50/80'
      }`}
      onClick={() => !open && setOpen(true)}
    >
      {/* Glow blobs when open */}
      {open && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-violet-300/15 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-indigo-300/15 blur-2xl" />
        </div>
      )}

      {/* Product row */}
      <div className="relative flex items-center gap-3 p-4">
        {/* Thumbnail */}
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-100 shadow-sm">
          {detail.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={detail.thumbnailUrl}
              alt={detail.productName || ''}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xl">
              🛍️
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate text-sm font-bold text-slate-800">
            {detail.productName || detail.sku}
          </p>
          {detail.variantName && (
            <p className="text-xs text-slate-500">Variant: {detail.variantName}</p>
          )}
          <p className="mt-1 text-xs text-slate-400">Tap to leave a review</p>
        </div>

        {/* Chip */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen((p) => !p);
          }}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
            open
              ? 'bg-violet-100 text-violet-700'
              : 'bg-violet-50 text-violet-500 hover:bg-violet-100 hover:text-violet-700'
          }`}
        >
          {open ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              Close
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Review
            </>
          )}
        </button>
      </div>

      {/* Expandable form */}
      {open && (
        <div
          className="relative border-t border-violet-100/80 px-4 pt-4 pb-5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Rating */}
          <div className="mb-4">
            <p className="mb-2 text-[10px] font-extrabold tracking-[0.12em] text-slate-400 uppercase">
              Rate this product
            </p>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          {/* Comment */}
          <div className="mb-4">
            <p className="mb-2 text-[10px] font-extrabold tracking-[0.12em] text-slate-400 uppercase">
              Share your thoughts
            </p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you love about it? Any suggestions? (min. 10 characters)"
              className="min-h-[80px] resize-none rounded-xl border-violet-200/70 bg-white/90 text-sm text-slate-700 shadow-sm placeholder:text-slate-300 focus-visible:border-violet-400 focus-visible:ring-1 focus-visible:ring-violet-300/50"
            />
            <div className="mt-1.5 flex justify-between text-[11px]">
              <span className="text-slate-400">Be honest — good or bad, it all helps</span>
              <span
                className={`font-semibold tabular-nums ${
                  comment.length === 0
                    ? 'text-slate-300'
                    : comment.length < 10
                      ? 'text-orange-400'
                      : 'text-emerald-500'
                }`}
              >
                {comment.length} / 10+
              </span>
            </div>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !canSubmit}
            size="sm"
            className="w-full gap-2 rounded-xl bg-violet-600 font-semibold text-white shadow-md shadow-violet-200/60 transition-all duration-200 hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-200/80 disabled:opacity-40 disabled:shadow-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Review
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Main export                                                */
/* ─────────────────────────────────────────────────────────── */

interface FeedbackFormProps {
  orderId: string;
  orderDetails: OrderDetailDto[];
}

export default function FeedbackForm({ orderId, orderDetails }: FeedbackFormProps) {
  // Vẫn giữ để đếm số lượng đã reviewed cho progress bar
  const { data: feedbacks = [], isLoading } = useGetOrderFeedbacksQuery(orderId);

  const reviewedCount = feedbacks.length;
  const totalCount = orderDetails.length;
  const allDone = reviewedCount >= totalCount;
  const progress = totalCount > 0 ? (reviewedCount / totalCount) * 100 : 0;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-[15px] font-bold text-slate-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-sm">
              <PenLine className="h-3.5 w-3.5 text-violet-600" />
            </span>
            Rate Your Products
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Your honest review helps others shop smarter.
          </p>
        </div>

        {/* Progress */}
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
              allDone ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700'
            }`}
          >
            {reviewedCount}/{totalCount}
          </span>
          <div className="h-1 w-16 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                allDone
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                  : 'bg-gradient-to-r from-violet-500 to-indigo-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-6">
          <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
          <span className="text-sm text-slate-400">Loading…</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {orderDetails.map((detail) => (
            // ✅ Không truyền feedback prop nữa — card tự gọi useGetOrderDetailFeedbackQuery
            <ProductReviewCard key={detail.id} orderId={orderId} detail={detail} />
          ))}
        </div>
      )}

      {/* All done */}
      {!isLoading && allDone && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 py-3 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          All products reviewed — thank you! 🎉
        </div>
      )}
    </div>
  );
}
