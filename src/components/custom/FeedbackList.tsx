'use client';

import { useState } from 'react';
import { useGetProductFeedbacksQuery } from '@/lib/api/endpoints/feedbackApi';
import { Loader2, Star, MessageCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import FeedbackItem from './FeedbackItem';

interface FeedbackListProps {
  productId: string;
}

export default function FeedbackList({ productId }: FeedbackListProps) {
  const [selectedRating, setSelectedRating] = useState<number | undefined>();
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const {
    data: feedbackData,
    isLoading,
    isError,
  } = useGetProductFeedbacksQuery({
    productId,
    rating: selectedRating,
    pageNumber,
    pageSize,
  });
  console.log(
    'FeedbackList - feedbackData:',
    feedbackData,
    'isLoading:',
    isLoading,
    'isError:',
    isError
  );
  if (isError) {
    return (
      <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <MessageCircle className="text-brand h-5 w-5" />
          Customer Feedbacks & Reviews
        </h3>
        <div className="text-muted-foreground text-center text-sm">Failed to load feedbacks</div>
      </div>
    );
  }

  const feedbacks = feedbackData?.data || [];
  const totalCount = feedbackData?.totalCount || 0;
  const hasNextPage = feedbackData?.hasNextPage || false;

  // Calculate average rating
  const averageRating =
    feedbacks.length > 0
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
      : '0';

  // Rating distribution
  const ratingCounts = [1, 2, 3, 4, 5].map((rating) => ({
    rating,
    count: feedbacks.filter((f) => f.rating === rating).length,
  }));

  return (
    <div className="bg-card border-border flex flex-col gap-5 rounded-xl border p-6 shadow-sm">
      <h3 className="flex items-center gap-2 text-lg font-bold">
        <MessageCircle className="text-brand h-5 w-5" />
        Customer Feedbacks & Reviews
      </h3>

      {/* Rating Summary */}
      {feedbacks.length > 0 && (
        <>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
            {/* Average Rating */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-brand text-3xl font-bold">{averageRating}</span>
                <span className="text-muted-foreground text-sm">/5</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(Number(averageRating))
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground text-xs">
                Based on {feedbacks.length} review{feedbacks.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="flex flex-1 flex-col gap-2">
              {ratingCounts.reverse().map(({ rating, count }) => {
                const percentage = feedbacks.length > 0 ? (count / feedbacks.length) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setSelectedRating(selectedRating === rating ? undefined : rating)
                      }
                      className="hover:text-brand flex items-center gap-1 whitespace-nowrap"
                    >
                      <span className="text-xs font-medium">{rating}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </button>
                    <div className="bg-muted h-2 flex-1 rounded-full">
                      <div
                        className="h-full rounded-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground text-xs">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />
        </>
      )}

      {/* Filter Display */}
      {selectedRating && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">
            Showing {selectedRating}-star reviews
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedRating(undefined)}
            className="h-7 px-2 text-xs"
          >
            Clear filter
          </Button>
        </div>
      )}

      {/* Feedbacks List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="text-brand h-8 w-8 animate-spin" />
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-muted/20 rounded-lg border border-dashed py-8 text-center">
          <MessageCircle className="text-muted-foreground/50 mx-auto mb-2 h-8 w-8" />
          <p className="text-muted-foreground text-sm">
            {totalCount === 0 ? 'No feedbacks yet' : 'No feedbacks matching your filter'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {feedbacks.map((feedback, index) => (
            <FeedbackItem
              key={feedback.id}
              feedback={feedback}
              isLastItem={index === feedbacks.length - 1}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasNextPage && (
        <Button
          variant="outline"
          onClick={() => setPageNumber(pageNumber + 1)}
          className="w-full gap-2"
        >
          <ChevronDown className="h-4 w-4" />
          Load More Reviews
        </Button>
      )}
    </div>
  );
}
