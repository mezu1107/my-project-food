// src/hooks/useCartValidation.ts
// PRODUCTION-READY — JANUARY 09, 2026
// FINAL VERSION: Exact match with backend validation logic
// Type-safe, clean, and reliable

import { useState } from 'react';

type CartErrors = Record<string, string>;

export const useCartValidation = () => {
  const [errors, setErrors] = useState<CartErrors>({});

  const clearErrors = () => setErrors({});

  /**
   * Validate payload for adding to cart
   * Matches backend addToCartSchema exactly
   */
  const validateAddToCart = (payload: {
    menuItemId: string;
    quantity?: number;
    sides?: string[];
    drinks?: string[];
    addOns?: string[];
    specialInstructions?: string;
  }): boolean => {
    const errors: CartErrors = {};

    const trimmedId = payload.menuItemId?.trim();
    if (!trimmedId) {
      errors.menuItemId = 'menuItemId is required';
    } else if (!/^[0-9a-fA-F]{24}$/.test(trimmedId)) {
      errors.menuItemId = 'Invalid menu item ID';
    }

    if (payload.quantity !== undefined) {
      if (!Number.isInteger(payload.quantity) || payload.quantity < 1 || payload.quantity > 50) {
        errors.quantity = 'Quantity must be between 1 and 50';
      }
    }

    if (payload.specialInstructions) {
      const trimmed = payload.specialInstructions.trim();
      if (trimmed.length > 300) {
        errors.specialInstructions = 'Special instructions too long (max 300 characters)';
      }
    }

    // sides, drinks, addOns are optional arrays — no validation needed beyond type

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Validate updates for cart item
   * Matches backend updateCartItemSchema exactly
   */
  const validateUpdateCartItem = (updates: {
    quantity?: number;
    sides?: string[];
    drinks?: string[];
    addOns?: string[];
    specialInstructions?: string;
    orderNote?: string;
  }): boolean => {
    const errors: CartErrors = {};

    // At least one field must be provided
    const fields: (keyof typeof updates)[] = [
      'quantity',
      'sides',
      'drinks',
      'addOns',
      'specialInstructions',
      'orderNote',
    ];
    const hasField = fields.some((field) => updates[field] !== undefined);
    if (!hasField) {
      errors.general = 'At least one field to update is required';
    }

    if (updates.quantity !== undefined) {
      if (!Number.isInteger(updates.quantity) || updates.quantity < 0 || updates.quantity > 50) {
        errors.quantity = 'Quantity must be 0–50 (0 removes item)';
      }
    }

    if (updates.specialInstructions !== undefined) {
      const trimmed = updates.specialInstructions.trim();
      if (trimmed.length > 300) {
        errors.specialInstructions = 'Special instructions too long (max 300 characters)';
      }
    }

    if (updates.orderNote !== undefined) {
      const trimmed = updates.orderNote.trim();
      if (trimmed.length > 500) {
        errors.orderNote = 'Order note too long (max 500 characters)';
      }
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return {
    errors,
    validateAddToCart,
    validateUpdateCartItem,
    clearErrors,
  };
};