// src/features/reviews/components/ReviewCard.tsx
import { format } from 'date-fns';
import { Star, Reply } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Review } from '../types/review.types';
import { cn } from '@/lib/utils';

interface ReviewCardProps {
  review: Review;
  showReply?: boolean;
}

export default function ReviewCard({ review, showReply = true }: ReviewCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {review.customer.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{review.customer.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-5 w-5',
                        i < review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(review.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>

          {review.isFeatured && (
            <Badge variant="secondary" className="animate-pulse">
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {review.comment && (
          <p className="text-base leading-relaxed text-foreground/90">
            {review.comment}
          </p>
        )}

        {review.images && review.images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {review.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Review image ${i + 1}`}
                className="rounded-lg object-cover w-full h-40 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.open(img, '_blank')}
              />
            ))}
          </div>
        )}

        {showReply && review.reply && (
          <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4 mt-6">
            <div className="flex items-center gap-2 mb-2">
              <Reply className="h-4 w-4 text-primary" />
              <p className="font-medium text-primary">Restaurant Reply</p>
            </div>
            <p className="text-sm leading-relaxed">{review.reply.text}</p>
            <p className="text-xs text-muted-foreground mt-3">
              — {review.reply.repliedBy.name},{' '}
              {format(new Date(review.reply.repliedAt), 'PPPp')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}