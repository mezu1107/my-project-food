import { Address, AreaOption, createGeoJSONPoint } from '../types/address.types';

// Extended mock areas with multiple cities
export const MOCK_AREA_OPTIONS: AreaOption[] = [
  // Lahore
  { _id: 'area_johar_town', name: 'Johar Town', city: 'Lahore', center: { lat: 31.4797, lng: 74.2787 } },
  { _id: 'area_dha', name: 'DHA Phase 5', city: 'Lahore', center: { lat: 31.4697, lng: 74.3887 } },
  { _id: 'area_gulberg', name: 'Gulberg III', city: 'Lahore', center: { lat: 31.5197, lng: 74.3487 } },
  { _id: 'area_model_town', name: 'Model Town', city: 'Lahore', center: { lat: 31.4897, lng: 74.3287 } },
  { _id: 'area_bahria_lhr', name: 'Bahria Town', city: 'Lahore', center: { lat: 31.3597, lng: 74.1787 } },
  // Karachi
  { _id: 'area_clifton', name: 'Clifton', city: 'Karachi', center: { lat: 24.8138, lng: 67.0294 } },
  { _id: 'area_dha_khi', name: 'DHA Phase 6', city: 'Karachi', center: { lat: 24.8055, lng: 67.0643 } },
  { _id: 'area_gulshan', name: 'Gulshan-e-Iqbal', city: 'Karachi', center: { lat: 24.9215, lng: 67.0935 } },
  // Islamabad
  { _id: 'area_f7', name: 'F-7 Markaz', city: 'Islamabad', center: { lat: 33.7215, lng: 73.0585 } },
  { _id: 'area_g11', name: 'G-11', city: 'Islamabad', center: { lat: 33.6844, lng: 73.0169 } },
  { _id: 'area_bahria_isb', name: 'Bahria Town', city: 'Islamabad', center: { lat: 33.5525, lng: 73.1238 } },
  // Rawalpindi
  { _id: 'area_saddar_rwp', name: 'Saddar', city: 'Rawalpindi', center: { lat: 33.5970, lng: 73.0477 } },
  { _id: 'area_bahria_rwp', name: 'Bahria Town Phase 8', city: 'Rawalpindi', center: { lat: 33.5180, lng: 73.1110 } },
  // Faisalabad
  { _id: 'area_peoples_colony', name: 'Peoples Colony', city: 'Faisalabad', center: { lat: 31.4187, lng: 73.0791 } },
];

// Mock user addresses - using backend format with location.coordinates [lng, lat]
export const MOCK_ADDRESSES: Address[] = [
  {
    _id: 'addr_1',
    user: 'user_123',
    label: 'Home',
    fullAddress: 'House 123, Street 5, Block C, Johar Town, Lahore',
    area: {
      _id: 'area_johar_town',
      name: 'Johar Town',
      city: 'Lahore',
    },
    location: createGeoJSONPoint(31.4797, 74.2787),
    instructions: 'Ring the doorbell twice',
    isDefault: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    _id: 'addr_2',
    user: 'user_123',
    label: 'Work',
    fullAddress: 'Office 456, DHA Phase 5, Main Boulevard, Lahore',
    area: {
      _id: 'area_dha',
      name: 'DHA Phase 5',
      city: 'Lahore',
    },
    location: createGeoJSONPoint(31.4697, 74.3887),
    isDefault: false,
    createdAt: '2024-02-01T14:00:00Z',
    updatedAt: '2024-02-01T14:00:00Z',
  },
];

// Get areas by city
export const getAreasByCity = (city: string): AreaOption[] => {
  return MOCK_AREA_OPTIONS.filter(area => area.city === city);
};

// Get all unique cities
export const getCities = (): string[] => {
  return [...new Set(MOCK_AREA_OPTIONS.map(area => area.city))];
};
