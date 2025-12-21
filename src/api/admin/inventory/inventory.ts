// src/api/inventory/inventory.ts
import { apiClient } from '@/lib/api';
import type { IngredientsApiResponse, StockHistoryApiResponse } from '@/types/inventory';

const BASE = '/inventory';

export const inventoryApi = {
  getIngredients: () =>
    apiClient.get<IngredientsApiResponse>(`${BASE}/ingredients`),

  createIngredient: (data: any) =>
    apiClient.post<{ success: true; ingredient: any }>(`${BASE}/ingredient`, data),

  updateIngredient: (id: string, data: any) =>
    apiClient.put<{ success: true; ingredient: any }>(`${BASE}/ingredient/${id}`, data),

  deleteIngredient: (id: string) =>
    apiClient.delete<{ success: true; message: string }>(`${BASE}/ingredient/${id}`),

  addStock: (data: { ingredientId: string; quantity: number; costPerUnit?: number; note?: string }) =>
    apiClient.post<{ success: true; ingredient: any }>(`${BASE}/add`, data),

  recordWaste: (data: { ingredientId: string; quantity: number; note?: string }) =>
    apiClient.post<{ success: true }>(`${BASE}/waste`, data),

  getHistory: (params: { ingredientId?: string; days?: number }) =>
    apiClient.get<StockHistoryApiResponse>(`${BASE}/history`, { params }),
};