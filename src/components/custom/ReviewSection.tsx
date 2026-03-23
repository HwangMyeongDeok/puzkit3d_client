'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, ChevronDown } from 'lucide-react';

import type { MockReview } from '@/lib/reviewMockData';

interface ReviewSectionProps {
  reviews: MockReview[];
  averageRating: number;
  totalCount: number;
  distribution: Record<number, number>;
}

export default function ReviewSection({
  reviews,
  averageRating,
  totalCount,
  distribution,
}: ReviewSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  if (totalCount === 0) {
    return (
      <div className="border-border bg-card rounded-xl border p-8 text-center">
        <p className="text-foreground mb-1 text-lg font-bold">No reviews yet</p>
        <p className="text-muted-foreground text-sm">Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="border-border bg-card rounded-xl border p-6">
      <h2 className="text-foreground mb-6 text-lg font-bold">Customer Reviews ({totalCount})</h2>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
        <div className="flex flex-col items-center justify-center gap-1 text-center">
          <span className="text-accent text-5xl font-extrabold">{averageRating}</span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(averageRating)
                    ? 'fill-warning text-warning'
                    : 'text-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          <span className="text-muted-foreground text-xs">{totalCount} reviews</span>
        </div>

        <div className="flex flex-col justify-center gap-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0;
            const percent = totalCount > 0 ? (count / totalCount) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-muted-foreground w-3 text-right text-xs">{star}</span>
                <Star className="fill-warning text-warning h-3 w-3 shrink-0" />
                <div className="bg-secondary h-2 flex-1 overflow-hidden rounded-full">
                  <div
                    className="bg-warning h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-muted-foreground w-6 text-right text-xs">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {displayedReviews.map((review) => (
          <div
            key={review.id}
            className="border-border flex gap-3 rounded-lg border p-4 transition-colors"
          >
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
              <Image
                src={review.avatar}
                alt={review.userName}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-foreground text-sm font-semibold">{review.userName}</span>
                <span className="text-muted-foreground text-[11px]">
                  {new Date(review.date).toLocaleDateString('en-US')}
                </span>
              </div>
              <div className="mb-2 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < review.rating ? 'fill-warning text-warning' : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>
            </div>
          </div>
        ))}
      </div>

      {reviews.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-brand hover:text-brand/80 mt-4 flex w-full items-center justify-center gap-1 text-sm font-semibold transition-colors"
        >
          {showAll ? 'Show less' : `View all ${reviews.length} reviews`}
          <ChevronDown className={`h-4 w-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  );
}
