// src/features/reviews/components/SubmitReviewModal.tsx
import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSubmitReview } from '../hooks/useSubmitReview';
import { cn } from '@/lib/utils';

interface SubmitReviewModalProps {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubmitReviewModal({
  orderId,
  open,
  onOpenChange,
}: SubmitReviewModalProps) {
  const [rating, setRating] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [comment, setComment] = useState('');
  const { mutate, isPending } = useSubmitReview();

  const handleSubmit = () => {
    if (rating === 0) return;

    mutate(
      {
        orderId,
        rating,
        comment: comment.trim() || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setRating(0);
          setComment('');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Order</DialogTitle>
          <DialogDescription>
            Share your experience to help us improve.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Your Rating</Label>
            <div className="flex justify-center gap-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-12 w-12 cursor-pointer transition-all duration-200',
                    i < rating
                      ? 'fill-yellow-400 text-yellow-400 scale-110'
                      : 'text-gray-300 hover:text-yellow-400'
                  )}
                  onClick={() => setRating((i + 1) as 1 | 2 | 3 | 4 | 5)}
                />
              ))}
            </div>
            {rating === 0 && (
              <p className="text-sm text-center text-amber-600">Please select a rating</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea
              id="comment"
              placeholder="Tell us about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-right text-muted-foreground">
              {comment.length}/500
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || isPending}
              className="min-w-32"
            >
              {isPending ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}