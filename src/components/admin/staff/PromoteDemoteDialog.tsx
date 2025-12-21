// src/components/admin/staff/PromoteDemoteDialog.tsx
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { StaffUser, StaffRole } from '@/types/staff';

interface Props {
  user: StaffUser; // ✅ Use full StaffUser type
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPromote: (id: string, role: StaffRole) => void;
  onDemote: (id: string) => void;
  isLoading: boolean;
}

const roleLabels: Record<StaffRole, string> = {
  kitchen: 'Kitchen Staff',
  delivery_manager: 'Delivery Manager',
  support: 'Customer Support',
  finance: 'Finance Team',
};

export const PromoteDemoteDialog = ({
  user,
  open,
  onOpenChange,
  onPromote,
  onDemote,
  isLoading
}: Props) => {
  const isStaff = ['kitchen', 'delivery_manager', 'support', 'finance'].includes(user.role);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isStaff ? 'Demote Staff' : 'Promote to Staff'}
          </DialogTitle>
          <DialogDescription>
            {user.name} ({user.phone}) — Current role: <strong>{user.role.replace('_', ' ')}</strong>
          </DialogDescription>
        </DialogHeader>

        {!isStaff ? (
          <div className="py-4">
            <label className="text-sm font-medium">Select Staff Role</label>
            <Select 
              onValueChange={(role: StaffRole) => onPromote(user._id, role)} 
              disabled={isLoading}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose role..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kitchen">Kitchen Staff</SelectItem>
                <SelectItem value="delivery_manager">Delivery Manager</SelectItem>
                <SelectItem value="support">Customer Support</SelectItem>
                <SelectItem value="finance">Finance Team</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <p className="py-8 text-center text-muted-foreground">
            Demote {user.name} from <strong>{roleLabels[user.role as StaffRole]}</strong> to regular customer?
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={isStaff ? 'destructive' : 'default'}
            onClick={() => isStaff ? onDemote(user._id) : onOpenChange(false)}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isStaff ? 'Demote' : 'Promote'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
