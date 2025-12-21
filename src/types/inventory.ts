// src/types/inventory.ts
export type IngredientCategory = 'meat' | 'vegetables' | 'spices' | 'dairy' | 'grains' | 'oil' | 'packaging' | 'other';
export type Unit = 'kg' | 'gram' | 'liter' | 'ml' | 'piece' | 'packet' | 'bottle' | 'dozen';

export interface Ingredient {
  _id: string;
  name: string;
  category: IngredientCategory;
  unit: Unit;
  currentStock: number;
  lowStockThreshold: number;
  costPerUnit: number;
  supplier?: string | null;
  isActive: boolean;
  isLowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockTransaction {
  _id: string;
  ingredient: { _id: string; name: string; unit: Unit };
  type: 'purchase' | 'use' | 'waste' | 'adjustment' | 'return';
  quantity: number;
  previousStock: number;
  newStock: number;
  note?: string;
  createdBy?: { _id: string; name: string; role: string } | null;
  createdAt: string;
}

export interface IngredientsApiResponse {
  success: true;
  total: number;
  lowStockCount: number;
  ingredients: Ingredient[];
  lowStockItems: Ingredient[];
}

export interface StockHistoryApiResponse {
  success: true;
  count: number;
  history: StockTransaction[];
}