// src/features/riders/admin/components/RiderStatusBadge.tsx
// RESPONSIVE PRODUCTION VERSION — JANUARY 14, 2026
// Adaptive size & padding for mobile vs desktop

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { AdminRider } from "../../types/adminRider.types";

const statusConfig: Record<
  AdminRider["riderStatus"],
  { label: string; className: string }
> = {
  pending: {
    label: "Pending Review",
    className:
      "bg-amber-100 text-amber-800 hover:bg-amber-100/90 border-amber-300",
  },
  approved: {
    label: "Approved",
    className:
      "bg-emerald-100 text-emerald-800 hover:bg-emerald-100/90 border-emerald-300",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 hover:bg-red-100/90 border-red-300",
  },
};

interface RiderStatusBadgeProps {
  status: AdminRider["riderStatus"];
  className?: string;
  size?: "default" | "sm" | "lg";
}

export function RiderStatusBadge({
  status,
  className,
  size = "default",
}: RiderStatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: "Unknown",
    className: "bg-gray-100 text-gray-800 border-gray-300",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    default: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  }[size];

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium tracking-wide transition-colors",
        sizeClasses,
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}