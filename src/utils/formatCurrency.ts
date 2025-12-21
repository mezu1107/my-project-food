// src/utils/formatCurrency.ts
export const formatPKR = (amount: number | undefined | null): string => {
  return `Rs. ${(amount ?? 0).toLocaleString()}`;
};