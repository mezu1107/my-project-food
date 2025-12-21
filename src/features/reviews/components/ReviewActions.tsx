// src/features/reviews/components/ReviewActions.tsx
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, X, Star, StarOff, MessageSquare } from 'lucide-react';

interface ReviewActionsProps {
  reviewId: string;
  isApproved: boolean;
  isFeatured: boolean;
  onAction: (action: 'approve' | 'reject' | 'feature' | 'unfeature') => void;
  onReply?: () => void;
}

export default function ReviewActions({
  reviewId,
  isApproved,
  isFeatured,
  onAction,
  onReply,
}: ReviewActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {!isApproved ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" onClick={() => onAction('approve')}>
              <Check className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Approve</TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="destructive" onClick={() => onAction('reject')}>
              <X className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reject</TooltipContent>
        </Tooltip>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant={isFeatured ? 'default' : 'outline'}
            onClick={() => onAction(isFeatured ? 'unfeature' : 'feature')}
          >
            {isFeatured ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isFeatured ? 'Unfeature' : 'Feature'}</TooltipContent>
      </Tooltip>

      {onReply && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="secondary" onClick={onReply}>
              <MessageSquare className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reply</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}