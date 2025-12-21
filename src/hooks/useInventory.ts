// src/hooks/useInventory.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/api/admin/inventory/inventory';
import { toast } from 'sonner';
import type { IngredientsApiResponse } from '@/types/inventory';

export const useInventory = () => {
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery<IngredientsApiResponse>({
    queryKey: ['inventory-ingredients'],
    queryFn: async () => {
      const res = await inventoryApi.getIngredients();
      return res; // apiClient returns the full response object with .data
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const createMutation = useMutation<void, Error, any>({
    mutationFn: async (data) => {
      await inventoryApi.createIngredient(data);
    },
    onSuccess: () => {
      toast.success('Ingredient created');
      qc.invalidateQueries({ queryKey: ['inventory-ingredients'] });
    },
    onError: () => toast.error('Failed to create ingredient'),
  });

  const updateMutation = useMutation<void, Error, { id: string; data: any }>({
    mutationFn: async ({ id, data }) => {
      await inventoryApi.updateIngredient(id, data);
    },
    onSuccess: () => {
      toast.success('Ingredient updated');
      qc.invalidateQueries({ queryKey: ['inventory-ingredients'] });
    },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await inventoryApi.deleteIngredient(id);
    },
    onSuccess: () => {
      toast.success('Ingredient deactivated');
      qc.invalidateQueries({ queryKey: ['inventory-ingredients'] });
    },
    onError: () => toast.error('Failed to deactivate'),
  });

  const addStockMutation = useMutation<void, Error, any>({
    mutationFn: async (data) => {
      await inventoryApi.addStock(data);
    },
    onSuccess: () => {
      toast.success('Stock added');
      qc.invalidateQueries({ queryKey: ['inventory-ingredients'] });
    },
    onError: () => toast.error('Failed to add stock'),
  });

  const wasteMutation = useMutation<void, Error, any>({
    mutationFn: async (data) => {
      await inventoryApi.recordWaste(data);
    },
    onSuccess: () => {
      toast.success('Waste recorded');
      qc.invalidateQueries({ queryKey: ['inventory-ingredients'] });
    },
    onError: () => toast.error('Failed to record waste'),
  });

  return {
    ingredients: data?.ingredients || [],
    lowStockCount: data?.lowStockCount || 0,
    lowStockItems: data?.lowStockItems || [],
    isLoading,
    isError,
    createIngredient: createMutation.mutate,
    updateIngredient: updateMutation.mutate,
    deleteIngredient: deleteMutation.mutate,
    addStock: addStockMutation.mutate,
    recordWaste: wasteMutation.mutate,
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      addStockMutation.isPending ||
      wasteMutation.isPending,
  };
};