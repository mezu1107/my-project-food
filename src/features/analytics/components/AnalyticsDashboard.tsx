// src/features/analytics/components/AnalyticsDashboard.tsx
// Updated: December 21, 2025

import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, RefreshCw } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';

import SummaryCards from './SummaryCards';
import RealtimeStats from './RealtimeStats';
import DailyTrendChart from './DailyTrendChart';
import PaymentMethodsChart from './PaymentMethodsChart';
import TopAreasChart from './TopAreasChart';
import PeakHoursChart from './PeakHoursChart';
import TopDealsTable from './TopDealsTable';

import { useOrderAnalytics } from '../hooks/useOrderAnalytics';
import { useRealtimeStats } from '../hooks/useRealtimeStats';

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'custom', label: 'Custom Range' },
] as const;

type PeriodType = typeof PERIOD_OPTIONS[number]['value'];

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState<PeriodType>('7d');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const isCustom = period === 'custom';
  const isRangeValid = isCustom && dateRange.from && dateRange.to;

  const queryParams = isRangeValid
    ? {
        startDate: format(dateRange.from!, 'yyyy-MM-dd'),
        endDate: format(dateRange.to!, 'yyyy-MM-dd'),
      }
    : { period };

  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useOrderAnalytics(queryParams);

  const {
    data: realtime,
    isLoading: realtimeLoading,
    error: realtimeError,
    refetch: refetchRealtime,
  } = useRealtimeStats();

  const handlePeriodChange = (value: string) => {
    setPeriod(value as PeriodType);
    if (value !== 'custom') {
      setDateRange({ from: undefined, to: undefined });
    }
  };

  const hasError = analyticsError || realtimeError;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time and historical insights into orders, revenue, and customer behavior.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchAnalytics();
              refetchRealtime();
            }}
            disabled={analyticsLoading || realtimeLoading}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', (analyticsLoading || realtimeLoading) && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Select Time Period</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Select value={period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isCustom && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal sm:w-[300px]',
                    !dateRange.from && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  {dateRange.from && dateRange.to ? (
                    <>
                      {format(dateRange.from, 'MMM dd, yyyy')} — {format(dateRange.to, 'MMM dd, yyyy')}
                    </>
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range: any) =>
                    setDateRange({
                      from: range?.from || undefined,
                      to: range?.to || undefined,
                    })
                  }
                  disabled={(date) => date > new Date() || date < new Date('2020-01-01')}
                  initialFocus
                  numberOfMonths={2}
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
          )}

          {isCustom && (!dateRange.from || !dateRange.to) && (
            <p className="text-sm text-amber-600">
              Please select both start and end dates for custom range.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Global Error Alert */}
      {hasError && (
        <Alert variant="destructive">
          <AlertTitle>Error Loading Analytics</AlertTitle>
          <AlertDescription>
            {(analyticsError as Error)?.message ||
              (realtimeError as Error)?.message ||
              'An unexpected error occurred. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading Skeleton for Main Content */}
      {(analyticsLoading || realtimeLoading) && !analytics && !realtime && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="realtime">Live Stats</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          <SummaryCards
            data={analytics?.summary}
            period={analytics?.period}
            loading={analyticsLoading}
          />
          <RealtimeStats data={realtime} loading={realtimeLoading} large />
        </TabsContent>

        {/* Live Stats Tab */}
        <TabsContent value="realtime" className="space-y-8">
          <RealtimeStats data={realtime} loading={realtimeLoading} large />
        </TabsContent>

        {/* Detailed Analytics Tab */}
        <TabsContent value="detailed" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DailyTrendChart data={analytics?.charts.dailyTrend} loading={analyticsLoading} />
            <PaymentMethodsChart data={analytics?.charts.paymentMethods} loading={analyticsLoading} />
            <TopAreasChart data={analytics?.charts.topAreas} loading={analyticsLoading} />
            <PeakHoursChart data={analytics?.charts.peakHours} loading={analyticsLoading} />
          </div>

          <TopDealsTable data={analytics?.charts.topDeals} loading={analyticsLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}