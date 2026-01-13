// src/features/riders/pages/OrderHistory.tsx
'use client';

import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // ← correct import

import { Button } from '@/components/ui/button';

import OrderHistoryList from '../components/OrderHistoryList';

export default function OrderHistory() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b supports-[backdrop-filter]:bg-background/80">
        <div className="container flex items-center h-16 px-4">
          <Button
            variant="ghost"
            size="icon"
            className="mr-3"
            onClick={() => navigate(-1)} // ← go back
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div>
            <h1 className="text-xl font-bold tracking-tight">Order History</h1>
            <p className="text-sm text-muted-foreground">
              All your completed and past deliveries
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1 container px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <OrderHistoryList />
        </div>
      </main>

      {/* Bottom padding for mobile */}
      <div className="h-20 md:hidden" />
    </div>
  );
}