// src/components/admin/inventory/InventoryList.tsx
import { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { IngredientTable } from './IngredientTable';
import { IngredientFormModal } from './IngredientFormModal';
import { StockActionDialog } from './StockActionDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Plus } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';

export const InventoryList = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [formOpen, setFormOpen] = useState(false);
  const [editIngredient, setEditIngredient] = useState<any>(null);
  const [stockAction, setStockAction] = useState<{ type: 'add' | 'waste'; ingredient: any } | null>(null);

  const {
    ingredients,
    lowStockCount,
    isLoading,
    isError,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    addStock,
    recordWaste,
    isMutating,
  } = useInventory();

  const handleSave = (data: any) => {
    if (editIngredient) {
      updateIngredient({ id: editIngredient._id, data });
    } else {
      createIngredient(data);
    }
    setFormOpen(false);
    setEditIngredient(null);
  };

  const handleStock = (data: any) => {
    if (stockAction?.type === 'add') {
      addStock(data);
    } else {
      recordWaste(data);
    }
    setStockAction(null);
  };

  if (isError) return <div className="text-center text-red-500">Failed to load inventory</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Inventory Management</CardTitle>
              {lowStockCount > 0 && (
                <p className="text-red-600 flex items-center gap-2 mt-2">
                  <AlertTriangle className="h-5 w-5" />
                  {lowStockCount} items are low on stock
                </p>
              )}
            </div>
            {isAdmin && (
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <IngredientTable
              ingredients={ingredients}
              onEdit={(i) => {
                setEditIngredient(i);
                setFormOpen(true);
              }}
              onDelete={(i) => deleteIngredient(i._id)}
              onAddStock={(i) => setStockAction({ type: 'add', ingredient: i })}
              onWaste={(i) => setStockAction({ type: 'waste', ingredient: i })}
            />
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <IngredientFormModal
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) setEditIngredient(null);
        }}
        ingredient={editIngredient}
        onSave={handleSave}
        isLoading={isMutating}
      />

      {stockAction && (
        <StockActionDialog
          open={!!stockAction}
          onOpenChange={(o) => !o && setStockAction(null)}
          type={stockAction.type}
          ingredient={stockAction.ingredient}
          onSubmit={handleStock}
          isLoading={isMutating}
        />
      )}
    </div>
  );
};