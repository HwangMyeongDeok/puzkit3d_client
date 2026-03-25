'use client';

import { useState } from 'react';
import {
  useGetOrderDetailFeedbackQuery,
  useCreateFeedbackMutation,
} from '@/lib/api/endpoints/feedbackApi';
import { Loader2, Star as StarIcon, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { FeedbackDto } from '@/types/api/feedback.api.types';

interface OrderFeedbackSectionProps {
  orderDetailId: string;
  orderId: string;
  productName: string | undefined;
  thumbnailUrl?: string;
  variantName?: string;
  isInstockOrPartner: boolean;
}

/* ─────────────────────────────────────────────────────────── */
/*  Main Section — decides: show existing OR show form        */
/* ─────────────────────────────────────────────────────────── */

export function OrderFeedbackSection({
  orderDetailId,
  orderId,
  productName,
  variantName,
}: OrderFeedbackSectionProps) {
  const { data, isLoading } = useGetOrderDetailFeedbackQuery(orderDetailId);

  const feedbacks = Array.isArray(data) ? data : data ? [data] : [];

  if (isLoading) {
    return (
      <div className="mt-4 flex items-center gap-2 py-2 text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-xs">Loading feedback...</span>
      </div>
    );
  }

  /* ── Already reviewed → read-only ── */
  if (feedbacks.length > 0) {
    return (
      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-800">Your Review</span>
        </div>
        <div className="flex flex-col gap-3">
          {feedbacks.map((fb) => (
            <FeedbackDisplay key={fb.id} feedback={fb} />
          ))}
        </div>
      </div>
    );
  }

  /* ── Not yet reviewed → show form ── */
  return (
    <InlineFeedbackForm
      orderDetailId={orderDetailId}
      orderId={orderId}
      productName={productName}
      variantName={variantName}
    />
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Read-only feedback display                                 */
/* ─────────────────────────────────────────────────────────── */

function FeedbackDisplay({ feedback }: { feedback: FeedbackDto }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-emerald-50 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {new Date(feedback.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
        <StarRating rating={feedback.rating} />
      </div>
      {feedback.comment && (
        <p className="text-xs leading-relaxed text-slate-600 italic">
          &ldquo;{feedback.comment}&rdquo;
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Inline form — locked after submit (one-time only)         */
/* ─────────────────────────────────────────────────────────── */

interface InlineFeedbackFormProps {
  orderDetailId: string;
  orderId: string;
  productName: string | undefined;
  variantName?: string;
}

function InlineFeedbackForm({
  orderDetailId,
  orderId,
  productName,
  variantName,
}: InlineFeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [createFeedback, { isLoading: isSubmitting }] = useCreateFeedbackMutation();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.warning('Please select a star rating before submitting.');
      return;
    }
    try {
      await createFeedback({
        orderDetailId,
        orderId,
        rating,
        comment: comment.trim(),
      }).unwrap();
      setSubmitted(true);
      toast.success('Thank you for your review!');
    } catch {
      toast.error('Failed to submit review. Please try again.');
    }
  };

  /* Show success state while RTK refetches and replaces this component */
  if (submitted) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/40 px-4 py-3">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
        <span className="text-sm font-medium text-emerald-800">Review submitted — thank you!</span>
      </div>
    );
  }

  const displayRating = hovered || rating;

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-slate-500" />
        <span className="text-sm font-semibold text-slate-700">Write a Review</span>
        {variantName && (
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
            {variantName}
          </span>
        )}
      </div>

      {/* Star picker */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-500">
          Rating <span className="text-red-400">*</span>
        </span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={isSubmitting}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110 focus:outline-none disabled:pointer-events-none"
            >
              <StarIcon
                className={`h-6 w-6 ${
                  star <= displayRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-xs text-slate-500">
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-500">Comment (optional)</span>
        <Textarea
          placeholder={`Share your thoughts about ${productName ?? 'this product'}…`}
          className="min-h-[80px] resize-none text-sm"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          disabled={isSubmitting}
        />
        <span className="self-end text-xs text-slate-400">{comment.length}/500</span>
      </div>

      {/* Submit */}
      <Button
        size="sm"
        onClick={handleSubmit}
        disabled={isSubmitting || rating === 0}
        className="self-end"
      >
        {isSubmitting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
        Submit Review
      </Button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Reusable read-only star rating                             */
/* ─────────────────────────────────────────────────────────── */

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
          }`}
        />
      ))}
    </div>
  );
}
