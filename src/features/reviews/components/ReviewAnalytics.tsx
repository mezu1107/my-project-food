// src/features/reviews/components/ReviewAnalytics.tsx
// FINAL PRODUCTION VERSION — ALL TS ERRORS FIXED

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell, // ✅ FIX: missing import
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useReviewAnalytics } from '../hooks/useReviewAnalytics';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReviewAnalytics() {
  // ✅ FIX 1: pass params object, not number
  const { data, isLoading } = useReviewAnalytics({ days: 30 });

  if (isLoading || !data) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-12 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // ✅ FIX 2 + 3: safely convert rating to number
  const distributionData = Object.entries(data.ratingDistribution)
    .map(([rating, count]) => {
      const ratingNumber = Number(rating);

      return {
        rating: ratingNumber,
        count,
        fill:
          ratingNumber === 5
            ? '#10b981'
            : ratingNumber >= 4
            ? '#3b82f6'
            : '#f59e0b',
      };
    })
    .sort((a, b) => a.rating - b.rating);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">
                {data.summary.averageRating}
              </span>
              <span className="text-2xl text-muted-foreground">/ 5</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Reviews
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {data.summary.totalReviews.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Approved
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">
              {data.summary.approvedReviews.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {data.summary.approvalRate} approval rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending
            </CardTitle>
            <Clock className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-orange-600">
              {data.summary.pendingReviews}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Rating Distribution (Last {data.period})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
