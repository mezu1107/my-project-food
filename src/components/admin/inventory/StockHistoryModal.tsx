// src/components/admin/inventory/StockHistoryModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Package, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '@/api/admin/inventory/inventory';
import type { StockHistoryApiResponse } from '@/types/inventory';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredientId?: string; // Optional: show history for one ingredient
}

export const StockHistoryModal = ({ open, onOpenChange, ingredientId }: Props) => {
  const { data, isLoading, isError } = useQuery<StockHistoryApiResponse>({
    queryKey: ['stock-history', ingredientId],
    queryFn: async () => {
      const res = await inventoryApi.getHistory({ ingredientId, days: 90 });
      return res;
    },
    enabled: open, // Only fetch when modal is open
  });

  const history = data?.history || [];

  const typeBadge: Record<string, { label: string; variant: 'default' | 'destructive' | 'secondary'; icon: React.ReactNode }> = {
    purchase: { label: 'Purchase', variant: 'default', icon: <ArrowUp className="h-3 w-3" /> },
    use: { label: 'Used', variant: 'secondary', icon: <Package className="h-3 w-3" /> },
    waste: { label: 'Waste', variant: 'destructive', icon: <ArrowDown className="h-3 w-3" /> },
    adjustment: { label: 'Adjustment', variant: 'secondary', icon: <AlertCircle className="h-3 w-3" /> },
    return: { label: 'Return', variant: 'default', icon: <ArrowUp className="h-3 w-3" /> },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Stock Transaction History</DialogTitle>
          <DialogDescription>
            {ingredientId
              ? 'Last 90 days of stock changes for this ingredient'
              : 'Recent stock transactions across all ingredients'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center text-red-500 py-8">Failed to load history</div>
          ) : history.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">No transactions found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Previous</TableHead>
                  <TableHead>New Stock</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((tx) => {
                  const badge = typeBadge[tx.type] || { label: tx.type, variant: 'secondary', icon: null };
                  return (
                    <TableRow key={tx._id}>
                      <TableCell>{format(new Date(tx.createdAt), 'dd MMM yyyy HH:mm')}</TableCell>
                      <TableCell className="font-medium">
                        {tx.ingredient.name} ({tx.ingredient.unit})
                      </TableCell>
                      <TableCell>
                        <Badge variant={badge.variant}>
                          <span className="flex items-center gap-1">
                            {badge.icon}
                            {badge.label}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={
                          tx.type === 'waste' || tx.type === 'use' ? 'text-red-600' : 'text-green-600'
                        }
                      >
                        {tx.type === 'waste' || tx.type === 'use' ? '-' : '+'}
                        {tx.quantity}
                      </TableCell>
                      <TableCell>{tx.previousStock}</TableCell>
                      <TableCell className="font-semibold">{tx.newStock}</TableCell>
                      <TableCell className="max-w-xs truncate">{tx.note || '-'}</TableCell>
                      <TableCell>{tx.createdBy?.name || 'System'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};