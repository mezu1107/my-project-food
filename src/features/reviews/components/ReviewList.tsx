// src/features/reviews/components/ReviewList.tsx
import { useApprovedReviews } from '../hooks/useReviews';
import ReviewCard from './ReviewCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReviewListProps {
  featuredOnly?: boolean;
  limit?: number;
}

export default function ReviewList({ featuredOnly = false, limit }: ReviewListProps = {}) {
  const { data, isLoading, error } = useApprovedReviews(limit);

  if (isLoading) {
    return (
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-80 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load reviews. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  const reviews = featuredOnly
    ? data?.reviews.filter((r) => r.isFeatured)
    : data?.reviews;

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-muted-foreground">
          {featuredOnly
            ? 'No featured reviews yet.'
            : 'No reviews yet. Be the first to share your experience!'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review) => (
        <ReviewCard key={review._id} review={review} />
      ))}
    </div>
  );
}