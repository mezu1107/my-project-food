// src/features/riders/admin/components/RiderStatsCards.tsx
// RESPONSIVE PRODUCTION VERSION — JANUARY 14, 2026
// Mobile/tablet/desktop friendly: grid adapts from 1 → 2 → 5 columns

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, CheckCircle2, Clock, XCircle, Activity } from "lucide-react";
import clsx from "clsx";

import type { RiderStats } from "../../types/adminRider.types";

interface RiderStatsCardsProps {
  stats?: RiderStats;
  isLoading: boolean;
  className?: string;
}

export function RiderStatsCards({ stats, isLoading, className }: RiderStatsCardsProps) {
  const statItems = [
    {
      title: "Total Riders",
      value: stats?.total ?? 0,
      icon: Users,
      color: "text-foreground",
      description: "All registered riders",
    },
    {
      title: "Available Now",
      value: stats?.available ?? 0,
      icon: Activity,
      color: "text-emerald-600 dark:text-emerald-400",
      description: "Currently online & available",
    },
    {
      title: "Approved",
      value: stats?.approved ?? 0,
      icon: CheckCircle2,
      color: "text-blue-600 dark:text-blue-400",
      description: "Active & verified riders",
    },
    {
      title: "Pending",
      value: stats?.pending ?? 0,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      description: "Applications under review",
    },
    {
      title: "Rejected",
      value: stats?.rejected ?? 0,
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      description: "Applications not approved",
    },
  ];

  return (
    <div
      className={clsx(
        "grid gap-4 sm:gap-6",
        "grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
        className
      )}
    >
      {isLoading
        ? Array(5)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2 sm:pb-3">
                  <Skeleton className="h-5 w-28 sm:w-32" />
                </CardHeader>
                <CardContent className="pb-4 sm:pb-6">
                  <Skeleton className="h-7 w-16 sm:h-8 sm:w-20" />
                  <Skeleton className="h-4 w-32 sm:w-40 mt-2" />
                </CardContent>
              </Card>
            ))
        : statItems.map((item, index) => (
            <Card
              key={index}
              className="overflow-hidden border-border hover:shadow-sm transition-shadow"
            >
              <CardHeader className="pb-2 sm:pb-3">
                <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
                  <item.icon className={clsx("h-4 w-4 sm:h-5 sm:w-5", item.color)} />
                  {item.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4 sm:pb-6">
                <div className={clsx("text-2xl sm:text-3xl font-bold", item.color)}>
                  {item.value.toLocaleString()}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
    </div>
  );
}