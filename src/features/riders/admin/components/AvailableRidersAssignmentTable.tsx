// src/features/riders/admin/components/AvailableRidersAssignmentTable.tsx
// RESPONSIVE PRODUCTION VERSION — JANUARY 14, 2026
// Mobile/tablet/desktop friendly: horizontal scroll + sticky column, adaptive sizing

import { Truck, MapPin, Star, Loader2 } from "lucide-react";
import clsx from "clsx";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";

import type { AdminRider } from "../../types/adminRider.types";

interface AvailableRidersAssignmentTableProps {
  riders: AdminRider[];
  isLoading: boolean;
  onAssign: (riderId: string) => void;
  assigningRiderId?: string | null;
  orderId: string;
}

export function AvailableRidersAssignmentTable({
  riders,
  isLoading,
  onAssign,
  assigningRiderId,
  orderId,
}: AvailableRidersAssignmentTableProps) {
  if (!orderId.trim()) {
    return (
      <div className="text-center py-10 sm:py-12 px-4 text-muted-foreground border rounded-lg bg-muted/30">
        <p className="text-base sm:text-lg font-medium">
          Enter an Order ID above to see available riders
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 px-2 sm:px-0">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 sm:gap-4 py-3">
            <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40 sm:w-56" />
              <Skeleton className="h-4 w-24 sm:w-32" />
            </div>
            <Skeleton className="h-9 w-24 sm:w-28 shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  if (riders.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 px-4 text-muted-foreground border rounded-lg bg-muted/30">
        <AlertTriangle className="mx-auto h-8 w-8 sm:h-10 sm:w-10 mb-4 opacity-70" />
        <p className="text-base sm:text-lg font-medium">
          No available riders right now
        </p>
        <p className="mt-2 text-sm">
          Check back later or adjust area filter
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 sm:w-12 min-w-[2.5rem] sticky left-0 bg-background z-10">
              {/* empty for status dot */}
            </TableHead>
            <TableHead className="min-w-[160px] sm:min-w-[180px]">Rider</TableHead>
            <TableHead className="min-w-[130px] sm:min-w-[140px]">Phone</TableHead>
            <TableHead className="min-w-[140px] sm:min-w-[160px]">Rating / Deliveries</TableHead>
            <TableHead className="min-w-[140px] sm:min-w-[160px]">Vehicle</TableHead>
            <TableHead className="text-right min-w-[120px] sm:min-w-[140px] pr-3 sm:pr-6">
              Assign
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {riders.map((rider) => {
            const isAssigning = assigningRiderId === rider._id;
            const vehicle = rider.riderDocuments?.vehicleType
              ? `${rider.riderDocuments.vehicleType}${
                  rider.riderDocuments.vehicleNumber ? ` (${rider.riderDocuments.vehicleNumber})` : ""
                }`
              : "—";

            return (
              <TableRow
                key={rider._id}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="sticky left-0 bg-background z-10">
                  <div
                    className={clsx(
                      "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold",
                      rider.isAvailable
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                    )}
                  >
                    {rider.isAvailable ? "ON" : "OFF"}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="font-medium text-sm sm:text-base">{rider.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    ID: {rider._id.slice(-8)}
                  </div>
                </TableCell>

                <TableCell className="font-mono text-sm">{rider.phone}</TableCell>

                <TableCell>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{rider.rating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      • {rider.totalDeliveries} deliveries
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    className="text-xs sm:text-sm px-2.5 py-0.5 font-normal"
                  >
                    {vehicle}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => onAssign(rider._id)}
                    disabled={isAssigning}
                    className="min-w-[100px] sm:min-w-[110px] h-9 sm:h-10"
                  >
                    {isAssigning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <Truck className="mr-1.5 sm:mr-2 h-4 w-4" />
                        Assign
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}