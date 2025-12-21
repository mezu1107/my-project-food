// src/components/admin/inventory/IngredientFormModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { Ingredient } from '@/types/inventory';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredient: Ingredient | null;
  onSave: (data: any) => void;
  isLoading: boolean;
}

const categories = [
  'meat', 'vegetables', 'spices', 'dairy', 'grains', 'oil', 'packaging', 'other',
] as const;

const units = [
  'kg', 'gram', 'liter', 'ml', 'piece', 'packet', 'bottle', 'dozen',
] as const;

export const IngredientFormModal = ({ open, onOpenChange, ingredient, onSave, isLoading }: Props) => {
  const isEdit = !!ingredient;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());

    // Convert numbers
    if (data.lowStockThreshold) data.lowStockThreshold = Number(data.lowStockThreshold) || 5;
    if (data.costPerUnit) data.costPerUnit = Number(data.costPerUnit) || 0;

    // Clean supplier
    if (data.supplier?.toString().trim() === '') data.supplier = null;

    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Ingredient' : 'Create New Ingredient'}</DialogTitle>
          <DialogDescription>
            {isEdit ? `Update ${ingredient?.name}` : 'Add a new ingredient to inventory'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" defaultValue={ingredient?.name} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={ingredient?.category || 'other'}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select name="unit" defaultValue={ingredient?.unit || 'kg'}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {units.map(u => (
                    <SelectItem key={u} value={u}>{u.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
              <Input
                id="lowStockThreshold"
                name="lowStockThreshold"
                type="number"
                min="0"
                step="0.01"
                defaultValue={ingredient?.lowStockThreshold ?? 5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costPerUnit">Cost per Unit (Rs.)</Label>
              <Input
                id="costPerUnit"
                name="costPerUnit"
                type="number"
                min="0"
                step="0.01"
                defaultValue={ingredient?.costPerUnit ?? ''}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier (Optional)</Label>
            <Input id="supplier" name="supplier" defaultValue={ingredient?.supplier || ''} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};