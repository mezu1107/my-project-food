// src/pages/AdminReviewsDashboard.tsx
// Admin Reviews Dashboard — Production Ready (December 21, 2025)

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminReviewTable from '@/features/reviews/components/AdminReviewTable';
import ReviewAnalytics from '@/features/reviews/components/ReviewAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminReviewsDashboard() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8">Reviews Dashboard</h1>

      <Tabs defaultValue="analytics" className="space-y-8">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="management">Review Management</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Review Analytics Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewAnalytics />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management">
          <AdminReviewTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}