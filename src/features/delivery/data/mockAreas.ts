import type { Area, DeliveryZone } from '../types/delivery.types';

// Comprehensive mock areas for Lahore - matching backend structure exactly
export const MOCK_AREAS: Area[] = [
  {
    _id: '6570a1b2c3d4e5f6a7b8c9d0',
    name: 'Gulberg',
    city: 'LAHORE',
    isActive: true,
    center: { 
      type: 'Point', 
      coordinates: [74.3436, 31.5156] // [lng, lat]
    },
    centerLatLng: { lat: 31.5156, lng: 74.3436 },
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [74.3236, 31.5356], // [lng, lat] - MongoDB format
        [74.3636, 31.5356],
        [74.3636, 31.4956],
        [74.3236, 31.4956],
        [74.3236, 31.5356] // Closed ring
      ]]
    },
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-01-15T10:30:00.000Z'
  },
  {
    _id: '6570a1b2c3d4e5f6a7b8c9d1',
    name: 'DHA Phase 5',
    city: 'LAHORE',
    isActive: true,
    center: { 
      type: 'Point', 
      coordinates: [74.4046, 31.4697]
    },
    centerLatLng: { lat: 31.4697, lng: 74.4046 },
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [74.3846, 31.4897],
        [74.4246, 31.4897],
        [74.4246, 31.4497],
        [74.3846, 31.4497],
        [74.3846, 31.4897]
      ]]
    },
    createdAt: '2024-01-16T11:00:00.000Z',
    updatedAt: '2024-01-16T11:00:00.000Z'
  },
  {
    _id: '6570a1b2c3d4e5f6a7b8c9d2',
    name: 'Johar Town',
    city: 'LAHORE',
    isActive: true,
    center: { 
      type: 'Point', 
      coordinates: [74.2671, 31.4672]
    },
    centerLatLng: { lat: 31.4672, lng: 74.2671 },
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [74.2471, 31.4872],
        [74.2871, 31.4872],
        [74.2871, 31.4472],
        [74.2471, 31.4472],
        [74.2471, 31.4872]
      ]]
    },
    createdAt: '2024-01-17T09:15:00.000Z',
    updatedAt: '2024-01-17T09:15:00.000Z'
  },
  {
    _id: '6570a1b2c3d4e5f6a7b8c9d3',
    name: 'Model Town',
    city: 'LAHORE',
    isActive: true,
    center: { 
      type: 'Point', 
      coordinates: [74.3150, 31.4833]
    },
    centerLatLng: { lat: 31.4833, lng: 74.3150 },
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [74.2950, 31.5033],
        [74.3350, 31.5033],
        [74.3350, 31.4633],
        [74.2950, 31.4633],
        [74.2950, 31.5033]
      ]]
    },
    createdAt: '2024-01-18T14:20:00.000Z',
    updatedAt: '2024-01-18T14:20:00.000Z'
  },
  {
    _id: '6570a1b2c3d4e5f6a7b8c9d4',
    name: 'Bahria Town',
    city: 'LAHORE',
    isActive: false, // Inactive - no delivery zone yet
    center: { 
      type: 'Point', 
      coordinates: [74.1833, 31.3667]
    },
    centerLatLng: { lat: 31.3667, lng: 74.1833 },
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [74.1533, 31.3967],
        [74.2133, 31.3967],
        [74.2133, 31.3367],
        [74.1533, 31.3367],
        [74.1533, 31.3967]
      ]]
    },
    createdAt: '2024-01-19T16:45:00.000Z',
    updatedAt: '2024-01-19T16:45:00.000Z'
  },
  {
    _id: '6570a1b2c3d4e5f6a7b8c9d5',
    name: 'Garden Town',
    city: 'LAHORE',
    isActive: true,
    center: { 
      type: 'Point', 
      coordinates: [74.3533, 31.5000]
    },
    centerLatLng: { lat: 31.5000, lng: 74.3533 },
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [74.3383, 31.5150],
        [74.3683, 31.5150],
        [74.3683, 31.4850],
        [74.3383, 31.4850],
        [74.3383, 31.5150]
      ]]
    },
    createdAt: '2024-01-20T08:30:00.000Z',
    updatedAt: '2024-01-20T08:30:00.000Z'
  },
  {
    _id: '6570a1b2c3d4e5f6a7b8c9d6',
    name: 'Faisal Town',
    city: 'LAHORE',
    isActive: false,
    center: { 
      type: 'Point', 
      coordinates: [74.3000, 31.4500]
    },
    centerLatLng: { lat: 31.4500, lng: 74.3000 },
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [74.2850, 31.4650],
        [74.3150, 31.4650],
        [74.3150, 31.4350],
        [74.2850, 31.4350],
        [74.2850, 31.4650]
      ]]
    },
    createdAt: '2024-01-21T12:00:00.000Z',
    updatedAt: '2024-01-21T12:00:00.000Z'
  },
  {
    _id: '6570a1b2c3d4e5f6a7b8c9d7',
    name: 'Cavalry Ground',
    city: 'LAHORE',
    isActive: true,
    center: { 
      type: 'Point', 
      coordinates: [74.3867, 31.5167]
    },
    centerLatLng: { lat: 31.5167, lng: 74.3867 },
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [74.3717, 31.5317],
        [74.4017, 31.5317],
        [74.4017, 31.5017],
        [74.3717, 31.5017],
        [74.3717, 31.5317]
      ]]
    },
    createdAt: '2024-01-22T10:15:00.000Z',
    updatedAt: '2024-01-22T10:15:00.000Z'
  }
];

// Mock delivery zones - linked to active areas
export const MOCK_DELIVERY_ZONES: DeliveryZone[] = [
  {
    _id: 'dz_001',
    area: '6570a1b2c3d4e5f6a7b8c9d0', // Gulberg
    deliveryFee: 99,
    minOrderAmount: 299,
    estimatedTime: '25-35 min',
    isActive: true,
    createdAt: '2024-01-15T10:35:00.000Z',
    updatedAt: '2024-01-15T10:35:00.000Z'
  },
  {
    _id: 'dz_002',
    area: '6570a1b2c3d4e5f6a7b8c9d1', // DHA Phase 5
    deliveryFee: 149,
    minOrderAmount: 499,
    estimatedTime: '35-45 min',
    isActive: true,
    createdAt: '2024-01-16T11:05:00.000Z',
    updatedAt: '2024-01-16T11:05:00.000Z'
  },
  {
    _id: 'dz_003',
    area: '6570a1b2c3d4e5f6a7b8c9d2', // Johar Town
    deliveryFee: 129,
    minOrderAmount: 399,
    estimatedTime: '30-40 min',
    isActive: true,
    createdAt: '2024-01-17T09:20:00.000Z',
    updatedAt: '2024-01-17T09:20:00.000Z'
  },
  {
    _id: 'dz_004',
    area: '6570a1b2c3d4e5f6a7b8c9d3', // Model Town
    deliveryFee: 99,
    minOrderAmount: 299,
    estimatedTime: '25-35 min',
    isActive: true,
    createdAt: '2024-01-18T14:25:00.000Z',
    updatedAt: '2024-01-18T14:25:00.000Z'
  },
  {
    _id: 'dz_005',
    area: '6570a1b2c3d4e5f6a7b8c9d5', // Garden Town
    deliveryFee: 79,
    minOrderAmount: 249,
    estimatedTime: '20-30 min',
    isActive: true,
    createdAt: '2024-01-20T08:35:00.000Z',
    updatedAt: '2024-01-20T08:35:00.000Z'
  },
  {
    _id: 'dz_006',
    area: '6570a1b2c3d4e5f6a7b8c9d7', // Cavalry Ground
    deliveryFee: 119,
    minOrderAmount: 349,
    estimatedTime: '30-40 min',
    isActive: true,
    createdAt: '2024-01-22T10:20:00.000Z',
    updatedAt: '2024-01-22T10:20:00.000Z'
  }
];

// Helper to check if a point is inside a polygon
export const isPointInPolygon = (lat: number, lng: number, polygon: number[][][]): boolean => {
  if (!polygon || !polygon[0]) return false;
  
  const ring = polygon[0];
  let inside = false;
  
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1]; // [lng, lat]
    const xj = ring[j][0], yj = ring[j][1];
    
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
};

// Find area and delivery zone by coordinates
export const findAreaByCoordinates = (lat: number, lng: number): {
  area: typeof MOCK_AREAS[0] | null;
  zone: typeof MOCK_DELIVERY_ZONES[0] | null;
} => {
  for (const area of MOCK_AREAS) {
    if (area.isActive && isPointInPolygon(lat, lng, area.polygon.coordinates)) {
      const zone = MOCK_DELIVERY_ZONES.find(z => z.area === area._id && z.isActive);
      return { area, zone: zone || null };
    }
  }
  return { area: null, zone: null };
};

// Get delivery zone for an area
export const getDeliveryZoneForArea = (areaId: string): DeliveryZone | null => {
  return MOCK_DELIVERY_ZONES.find(z => z.area === areaId) || null;
};
