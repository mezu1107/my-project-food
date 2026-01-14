// src/features/riders/admin/components/RiderModerationDialog.tsx
// RESPONSIVE PRODUCTION VERSION — JANUARY 14, 2026
// Mobile/tablet/desktop friendly: larger touch targets, adaptive dialog width

import { useState } from "react";
import { AlertTriangle, Ban, XCircle, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import type { AdminRider } from "../../types/adminRider.types";

type ModerationType = "reject" | "block" | "permanent-ban";

interface RiderModerationDialogProps {
  rider: AdminRider;
  type: ModerationType;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
}

const typeConfig: Record<
  ModerationType,
  { title: string; description: string; buttonText: string; variant: "default" | "destructive" }
> = {
  reject: {
    title: "Reject Rider Application",
    description: "This action will reject the rider's application. A reason is required.",
    buttonText: "Reject Application",
    variant: "destructive",
  },
  block: {
    title: "Block Rider Account",
    description: "Blocked riders cannot accept orders until unblocked. Provide a reason.",
    buttonText: "Block Rider",
    variant: "destructive",
  },
  "permanent-ban": {
    title: "Permanently Ban Rider",
    description:
      "This action is irreversible. The rider will lose access permanently. A detailed reason is required.",
    buttonText: "Permanently Ban",
    variant: "destructive",
  },
};

export function RiderModerationDialog({
  rider,
  type,
  onConfirm,
  isLoading = false,
  trigger,
  children,
}: RiderModerationDialogProps) {
  const [reason, setReason] = useState("");
  const [open, setOpen] = useState(false);

  const config = typeConfig[type];

  const handleSubmit = () => {
    const trimmed = reason.trim();
    if (trimmed.length < 10) {
      toast.error("Reason must be at least 10 characters long");
      return;
    }

    onConfirm(trimmed);
    setReason("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || children || (
          <Button
            variant={config.variant}
            size="sm"
            className="min-w-[110px] sm:min-w-[130px] h-9 sm:h-10"
          >
            {config.buttonText}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-[90vw] sm:max-w-[500px] p-4 sm:p-6">
        <DialogHeader className="space-y-3 sm:space-y-4">
          <DialogTitle className="flex items-center gap-2.5 text-lg sm:text-xl text-destructive">
            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 sm:py-6 space-y-5 sm:space-y-6">
          <div className="p-3 sm:p-4 bg-muted/60 rounded-lg text-sm sm:text-base">
            <strong className="block mb-1">Rider:</strong>
            <span className="font-medium">{rider.name}</span> • {rider.phone}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm sm:text-base">
              Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Enter detailed reason (minimum 10 characters)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[110px] sm:min-h-[130px] resize-none text-sm sm:text-base"
              disabled={isLoading}
            />
            <p className="text-xs sm:text-sm text-muted-foreground">
              This reason will be visible to the rider (if notification is sent).
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
            className="w-full sm:w-auto min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isLoading || reason.trim().length < 10}
            className="w-full sm:w-auto min-w-[130px] sm:min-w-[150px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              config.buttonText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}