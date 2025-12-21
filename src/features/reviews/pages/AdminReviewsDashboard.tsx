// src/pages/CustomerReviewsPage.tsx
// Public Customer Reviews Page — Production Ready (December 21, 2025)

import ReviewList from '@/features/reviews/components/ReviewList';
import ReviewAnalytics from '@/features/reviews/components/ReviewAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

export default function CustomerReviewsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Customer Reviews</h1>
        <p className="text-xl text-muted-foreground">
          See what our customers are saying about their experience
        </p>
      </div>

      {/* Featured Reviews Section */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <Star className="h-8 w-8 text-yellow-500" />
          <h2 className="text-3xl font-semibold">Featured Reviews</h2>
        </div>
        <ReviewList featuredOnly limit={6} />
      </section>

      {/* Analytics Summary */}
      <section className="mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Review Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewAnalytics />
          </CardContent>
        </Card>
      </section>

      {/* All Approved Reviews */}
      <section>
        <h2 className="text-3xl font-semibold mb-8">All Reviews</h2>
        <ReviewList />
      </section>
    </div>
  );
}