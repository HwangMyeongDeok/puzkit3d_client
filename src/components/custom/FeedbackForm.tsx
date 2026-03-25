'use client';

import { useState } from 'react';
import {
  useCreateFeedbackMutation,
  useGetOrderFeedbacksQuery,
} from '@/lib/api/endpoints/feedbackApi';
import type { OrderDetailDto } from '@/types/api/order.api.types';
import { toast } from 'sonner';
import { Loader2, Star, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface FeedbackFormProps {
  orderId: string;
  orderDetails: OrderDetailDto[];
}

export default function FeedbackForm({ orderId, orderDetails }: FeedbackFormProps) {
  const [selectedDetailId, setSelectedDetailId] = useState<string>(orderDetails[0]?.id || '');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const [createFeedback, { isLoading: isSubmitting }] = useCreateFeedbackMutation();
  const { data: existingFeedbacks = [] } = useGetOrderFeedbacksQuery(orderId);

  const selectedDetail = orderDetails.find((d) => d.id === selectedDetailId);
  const hasFeedbackForDetail = existingFeedbacks.some((f) => f.orderDetailId === selectedDetailId);
  const canSubmit = !hasFeedbackForDetail && selectedDetail && comment.trim().length >= 10;

  const handleSubmit = async () => {
    if (!selectedDetailId.trim()) {
      toast.error('Please select a product');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Comment must be at least 10 characters');
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error('Rating must be between 1 and 5');
      return;
    }

    try {
      console.log('Submitting feedback with payload:', {
        orderId,
        orderDetailId: selectedDetailId,
        rating,
        comment: comment.trim(),
      });

      await createFeedback({
        orderId,
        orderDetailId: selectedDetailId,
        rating,
        comment: comment.trim(),
      }).unwrap();

      toast.success('Feedback submitted successfully!', {
        description: 'Thank you for your review.',
      });

      setComment('');
      setRating(5);
      setSelectedDetailId(orderDetails[0]?.id || '');
    } catch {
      toast.error('Failed to submit feedback', {
        description: 'Please try again later.',
      });
    }
  };

  return (
    <div className="bg-card border-border flex flex-col gap-5 rounded-xl border p-6 shadow-sm">
      <h3 className="flex items-center gap-2 text-lg font-bold">
        <MessageCircle className="text-brand h-5 w-5" />
        Leave a Feedback
      </h3>

      <div className="flex flex-col gap-4">
        {/* Product Selection */}
        <div className="flex flex-col gap-2">
          <Label className="font-semibold">Select Product</Label>
          <div className="flex flex-col gap-2">
            {orderDetails.map((detail) => {
              const hasReview = existingFeedbacks.some((f) => f.orderDetailId === detail.id);
              return (
                <div
                  key={detail.id}
                  className={`border-border cursor-pointer rounded-lg border p-3 transition-all ${
                    selectedDetailId === detail.id
                      ? 'bg-brand/10 border-brand/30'
                      : 'bg-muted/20 hover:bg-muted/30'
                  } ${hasReview ? 'opacity-60' : ''}`}
                  onClick={() => !hasReview && setSelectedDetailId(detail.id)}
                >
                  <div className="flex items-start gap-3">
                    {detail.thumbnailUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={detail.thumbnailUrl}
                        alt={detail.productName || ''}
                        className="border-border h-12 w-12 shrink-0 rounded border object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-foreground font-semibold">
                        {detail.productName || detail.sku || detail.id}
                      </p>
                      {detail.variantName && (
                        <p className="text-muted-foreground text-xs">
                          Variant: {detail.variantName}
                        </p>
                      )}
                    </div>
                    {hasReview && (
                      <span className="shrink-0 rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                        ✓ Reviewed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Rating Selection */}
        <div className="flex flex-col gap-3">
          <Label className="font-semibold">Rating</Label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(null)}
                disabled={hasFeedbackForDetail}
                className="transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
                title={`${value} star${value > 1 ? 's' : ''}`}
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    (hoveredRating || rating) >= value
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
            <span className="text-muted-foreground ml-2 text-sm">
              {hoveredRating || rating} / 5
            </span>
          </div>
        </div>

        {/* Comment */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="feedback-comment" className="font-semibold">
            Comment (minimum 10 characters)
          </Label>
          <Textarea
            id="feedback-comment"
            placeholder="Share your experience with this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={hasFeedbackForDetail}
            className="min-h-24 resize-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          <div className="flex items-center justify-between text-xs">
            <span />
            <span className={comment.length < 10 ? 'text-muted-foreground' : 'text-emerald-600'}>
              {comment.length} characters
            </span>
          </div>
        </div>

        {/* Submit Button */}
        {hasFeedbackForDetail ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
            <p className="text-sm font-medium text-emerald-700">
              ✓ Thank you! You already reviewed this product.
            </p>
          </div>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !canSubmit}
            className="bg-brand hover:bg-brand/90 w-full gap-2 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Feedback
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
