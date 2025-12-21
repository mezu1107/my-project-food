// src/components/admin/inventory/StockActionDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { Ingredient } from '@/types/inventory';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'add' | 'waste';
  ingredient: Ingredient;
  onSubmit: (data: {
    ingredientId: string;
    quantity: number;
    costPerUnit?: number;
    note?: string;
  }) => void;
  isLoading: boolean;
}

export const StockActionDialog = ({
  open,
  onOpenChange,
  type,
  ingredient,
  onSubmit,
  isLoading,
}: Props) => {
  const isAdd = type === 'add';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // CRITICAL FIX: Convert string to number
    const quantityStr = formData.get('quantity')?.toString().trim();
    const quantity = quantityStr ? parseFloat(quantityStr) : NaN;

    if (!quantityStr || isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid positive quantity');
      return;
    }

    const data: any = {
      ingredientId: ingredient._id,
      quantity, // ← now a real number!
    };

    if (isAdd) {
      const costStr = formData.get('costPerUnit')?.toString().trim();
      if (costStr && !isNaN(parseFloat(costStr))) {
        data.costPerUnit = parseFloat(costStr);
      }
    }

    const note = formData.get('note')?.toString().trim();
    if (note) data.note = note;

    onSubmit(data);
    onOpenChange(false); // Close on success
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isAdd ? 'Add Stock' : 'Record Waste'}</DialogTitle>
          <DialogDescription>
            {ingredient.name} — Current: {ingredient.currentStock} {ingredient.unit}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantity ({ingredient.unit}) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="0.01"
              step="0.01"
              required
              placeholder={`e.g., 2.5`}
              disabled={isLoading}
            />
          </div>

          {isAdd && (
            <div className="space-y-2">
              <Label htmlFor="costPerUnit">Cost per Unit (Rs.) (optional)</Label>
              <Input
                id="costPerUnit"
                name="costPerUnit"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 450.00"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              name="note"
              placeholder="Reason for waste or purchase note"
              rows={3}
              maxLength={200}
              disabled={isLoading}
            />
          </div>

          <DialogFooter className="gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                isAdd ? 'Add Stock' : 'Record Waste'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};