// src/features/analytics/AnalyticsPage.tsx
import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnalyticsDashboard from './components/AnalyticsDashboard';
// If you prefer to inline everything in one file, use the components below instead of importing AnalyticsDashboard

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<string>('7d');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const isCustom = period === 'custom';

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Order Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor sales, performance, customer behavior, and real-time operations.
        </p>
      </div>

      <div className="bg-background border rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h2 className="text-2xl font-semibold">Performance Overview</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isCustom
                  ? dateRange.from && dateRange.to
                    ? `Custom range: ${format(dateRange.from, 'PPP')} – ${format(dateRange.to, 'PPP')}`
                    : 'Select a custom date range'
                  : `Period: ${period === 'today' ? 'Today' : period === 'yesterday' ? 'Yesterday' : `Last ${period.replace('d', ' days').replace('h', ' hours')}`}`}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Select value={period} onValueChange={(v) => {
                setPeriod(v);
                if (v !== 'custom') setDateRange({ from: undefined, to: undefined });
              }}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {isCustom && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full sm:w-[300px] justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from && dateRange.to ? (
                        `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="range"
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range: any) => {
                        setDateRange({
                          from: range?.from,
                          to: range?.to,
                        });
                      }}
                      numberOfMonths={2}
                      disabled={(date) =>
                        date > new Date() || date < new Date(new Date().setFullYear(new Date().getFullYear() - 2))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <AnalyticsDashboard />
        </div>
      </div>
    </div>
  );
}