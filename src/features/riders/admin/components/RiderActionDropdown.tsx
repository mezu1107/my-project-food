// src/features/riders/admin/components/RiderActionDropdown.tsx
// RESPONSIVE PRODUCTION VERSION — JANUARY 14, 2026
// Touch-friendly dropdown with larger tap targets, better spacing

import {
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Ban,
  Unlock,
  Trash2,
  RotateCcw,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import type { AdminRider } from "../../types/adminRider.types";

interface RiderActionDropdownProps {
  rider: AdminRider;
  onApprove?: (riderId: string) => void;
  onReject?: (riderId: string) => void;
  onBlock?: (riderId: string) => void;
  onUnblock?: (riderId: string) => void;
  onPermanentBan?: (riderId: string) => void;
  onSoftDelete?: (riderId: string) => void;
  onRestore?: (riderId: string) => void;
  disabled?: boolean;
}

export function RiderActionDropdown({
  rider,
  onApprove,
  onReject,
  onBlock,
  onUnblock,
  onPermanentBan,
  onSoftDelete,
  onRestore,
  disabled = false,
}: RiderActionDropdownProps) {
  const isPending = rider.riderStatus === "pending";
  const isApproved = rider.riderStatus === "approved";
  const isBlocked = rider.isBlocked === true;
  const isDeleted = rider.isDeleted === true;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 sm:h-10 sm:w-10"
          disabled={disabled}
        >
          <span className="sr-only">Open rider actions menu</span>
          <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 sm:w-60 min-w-[220px] p-1"
      >
        <DropdownMenuLabel className="px-3 py-2 text-sm font-semibold">
          Rider Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />

        {isPending && (
          <>
            <DropdownMenuItem
              onClick={() => onApprove?.(rider._id)}
              className="text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700 px-3 py-2.5 text-sm sm:text-base cursor-pointer"
            >
              <CheckCircle2 className="mr-2.5 h-4 w-4 sm:h-5 sm:w-5" />
              Approve Rider
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onReject?.(rider._id)}
              className="text-amber-600 focus:bg-amber-50 focus:text-amber-700 px-3 py-2.5 text-sm sm:text-base cursor-pointer"
            >
              <XCircle className="mr-2.5 h-4 w-4 sm:h-5 sm:w-5" />
              Reject Application
            </DropdownMenuItem>
          </>
        )}

        {isApproved && !isBlocked && !isDeleted && (
          <DropdownMenuItem
            onClick={() => onBlock?.(rider._id)}
            className="text-red-600 focus:bg-red-50 focus:text-red-700 px-3 py-2.5 text-sm sm:text-base cursor-pointer"
          >
            <Ban className="mr-2.5 h-4 w-4 sm:h-5 sm:w-5" />
            Block Rider
          </DropdownMenuItem>
        )}

        {isBlocked && !isDeleted && (
          <DropdownMenuItem
            onClick={() => onUnblock?.(rider._id)}
            className="text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700 px-3 py-2.5 text-sm sm:text-base cursor-pointer"
          >
            <Unlock className="mr-2.5 h-4 w-4 sm:h-5 sm:w-5" />
            Unblock Rider
          </DropdownMenuItem>
        )}

        {isApproved && !isDeleted && (
          <DropdownMenuItem
            onClick={() => onPermanentBan?.(rider._id)}
            className="text-red-700 focus:bg-red-50 focus:text-red-800 font-medium px-3 py-2.5 text-sm sm:text-base cursor-pointer"
          >
            <Ban className="mr-2.5 h-4 w-4 sm:h-5 sm:w-5" />
            Permanent Ban
          </DropdownMenuItem>
        )}

        {!isDeleted ? (
          <DropdownMenuItem
            onClick={() => onSoftDelete?.(rider._id)}
            className="text-slate-700 focus:bg-slate-50 focus:text-slate-800 px-3 py-2.5 text-sm sm:text-base cursor-pointer"
          >
            <Trash2 className="mr-2.5 h-4 w-4 sm:h-5 sm:w-5" />
            Soft Delete
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => onRestore?.(rider._id)}
            className="text-blue-600 focus:bg-blue-50 focus:text-blue-700 px-3 py-2.5 text-sm sm:text-base cursor-pointer"
          >
            <RotateCcw className="mr-2.5 h-4 w-4 sm:h-5 sm:w-5" />
            Restore Account
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}