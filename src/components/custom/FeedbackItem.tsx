'use client';

import { Star, Loader2 } from 'lucide-react';
import { useGetUserByIdQuery } from '@/lib/api/endpoints/userApi';
import type { FeedbackDto } from '@/types/api/feedback.api.types';
import { Separator } from '@/components/ui/separator';

interface FeedbackItemProps {
  feedback: FeedbackDto;
  isLastItem: boolean;
}

export default function FeedbackItem({ feedback, isLastItem }: FeedbackItemProps) {
  const { data: user, isLoading: isUserLoading } = useGetUserByIdQuery(feedback.userId);
  const userName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : 'Anonymous User';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {isUserLoading ? (
                <Loader2 className="text-muted-foreground h-3 w-3 animate-spin" />
              ) : (
                <p className="text-foreground text-sm font-medium">{userName}</p>
              )}
            </div>
            <span className="text-muted-foreground text-xs">
              {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>
      <p className="text-foreground text-sm leading-relaxed">{feedback.comment}</p>
      {!isLastItem && <Separator className="mt-2" />}
    </div>
  );
}
