import { z } from 'zod';

export const ADDRESS_LABELS = ['Home', 'Work', 'Other'] as const;
export type AddressLabel = (typeof ADDRESS_LABELS)[number];

export interface Address {
  _id: string;
  label: AddressLabel;
  fullAddress: string;
  area: {
    _id: string;
    name: string;
    city: string;
  };
  instructions?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AddressFormData = {
  label: AddressLabel;
  fullAddress: string;
  areaId: string;
  instructions?: string;
  isDefault?: boolean;
};

export const addressSchema = z.object({
  label: z.enum(ADDRESS_LABELS),
  fullAddress: z.string().min(10).max(200),
  areaId: z.string().min(1),
  instructions: z.string().max(150).optional(),
  isDefault: z.boolean().optional(),
});