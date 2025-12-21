// src/features/reviews/components/AdminReviewTable.tsx
// FINAL PRODUCTION VERSION — ALL TS ERRORS FIXED

import { useState } from 'react';
import { formatDate } from '@/utils/formatDate';



import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';

import {
  MoreHorizontal,
  Check,
  X,
  Star,
  StarOff,
} from 'lucide-react';

import { useReviews } from '../hooks/useReviews';
import { api } from '@/lib/api';

type FilterType = 'all' | 'pending' | 'approved';

export default function AdminReviewTable() {
  const [filter, setFilter] = useState<FilterType>('pending');

  const { data, isLoading, refetch } = useReviews({
    approved:
      filter === 'approved'
        ? true
        : filter === 'pending'
        ? false
        : undefined,
    limit: 50,
  });

  const handleAction = async (
    id: string,
    action: 'approve' | 'reject' | 'feature' | 'unfeature'
  ) => {
    try {
      await api.patch(`/reviews/${id}/action`, { action });
      toast({ title: 'Success', description: `Review ${action}d.` });
      refetch();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update review.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return;

    try {
      // ✅ FIX: pass as query param instead of config.data
      await api.delete(`/reviews/${id}?hardDelete=false`);
      toast({ title: 'Deleted', description: 'Review soft-deleted.' });
      refetch();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Review Management</h2>

        <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">
              Pending ({data?.pagination.total || 0})
            </SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="all">All Reviews</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                </TableRow>
              ))
            ) : data?.reviews.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No reviews found.
                </TableCell>
              </TableRow>
            ) : (
              data?.reviews.map((review) => (
                <TableRow key={review._id}>
                  <TableCell className="font-medium">
                    {review.customer.name}
                  </TableCell>
                  <TableCell>{review.rating} ⭐</TableCell>
                  <TableCell className="max-w-md truncate">
                    {review.comment || '-'}
                  </TableCell>
                  <TableCell>
                    formatDate(review.createdAt);

                  </TableCell>
                  <TableCell>
                    <Badge variant={review.isApproved ? 'default' : 'secondary'}>
                      {review.isApproved ? 'Approved' : 'Pending'}
                    </Badge>
                    {review.isFeatured && (
                      <Badge className="ml-2">Featured</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!review.isApproved && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleAction(review._id, 'approve')
                            }
                          >
                            <Check className="mr-2 h-4 w-4" /> Approve
                          </DropdownMenuItem>
                        )}

                        {review.isApproved && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleAction(review._id, 'reject')
                            }
                          >
                            <X className="mr-2 h-4 w-4" /> Reject
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          onClick={() =>
                            handleAction(
                              review._id,
                              review.isFeatured ? 'unfeature' : 'feature'
                            )
                          }
                        >
                          {review.isFeatured ? (
                            <StarOff className="mr-2 h-4 w-4" />
                          ) : (
                            <Star className="mr-2 h-4 w-4" />
                          )}
                          {review.isFeatured ? 'Unfeature' : 'Feature'}
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(review._id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
