// Mock Menu Items Data - 30+ items across categories
// Fully aligned with backend schema and area IDs from mockAreas.ts

import type { MenuItem } from '../types/menu.types';

// Area IDs matching mockAreas.ts exactly (MongoDB ObjectId format)
const GULBERG_ID = '6570a1b2c3d4e5f6a7b8c9d0';
const DHA_ID = '6570a1b2c3d4e5f6a7b8c9d1';
const JOHAR_TOWN_ID = '6570a1b2c3d4e5f6a7b8c9d2';
const MODEL_TOWN_ID = '6570a1b2c3d4e5f6a7b8c9d3';
const BAHRIA_ID = '6570a1b2c3d4e5f6a7b8c9d4';
const GARDEN_TOWN_ID = '6570a1b2c3d4e5f6a7b8c9d5';
const FAISAL_TOWN_ID = '6570a1b2c3d4e5f6a7b8c9d6';
const CAVALRY_ID = '6570a1b2c3d4e5f6a7b8c9d7';

export const mockMenuItems: MenuItem[] = [
  // ==================== BREAKFAST (6 items) ====================
  {
    _id: '65a1b2c3d4e5f6a7b8c90001',
    name: 'Halwa Puri',
    description: 'Traditional Pakistani breakfast with fluffy puri, sweet halwa, and spicy chickpea curry',
    price: 299,
    image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=500',
    category: 'breakfast',
    isVeg: true,
    isSpicy: false,
    isAvailable: true,
    availableInAreas: [], // Global
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90002',
    name: 'Paratha with Omelette',
    description: 'Flaky layered paratha served with fluffy masala omelette and mint chutney',
    price: 249,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500',
    category: 'breakfast',
    isVeg: false,
    isSpicy: false,
    isAvailable: true,
    availableInAreas: [], // Global
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90003',
    name: 'Nihari Breakfast Special',
    description: 'Slow-cooked beef nihari, perfect for a hearty breakfast with naan',
    price: 449,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500',
    category: 'breakfast',
    isVeg: false,
    isSpicy: true,
    isAvailable: true,
    availableInAreas: [GULBERG_ID, DHA_ID], // Only Gulberg & DHA
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90004',
    name: 'Chana Masala with Kulcha',
    description: 'Spicy chickpea curry with soft kulcha bread - vegetarian delight',
    price: 199,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500',
    category: 'breakfast',
    isVeg: true,
    isSpicy: true,
    isAvailable: true,
    availableInAreas: [], // Global
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90005',
    name: 'Lahori Nashta Platter',
    description: 'Complete Lahori breakfast: paya, siri, naan, and lassi',
    price: 699,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500',
    category: 'breakfast',
    isVeg: false,
    isSpicy: true,
    isAvailable: true,
    availableInAreas: [JOHAR_TOWN_ID], // Johar Town Special
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90006',
    name: 'Andaa Paratha',
    description: 'Egg-stuffed paratha, crispy and golden, served with yogurt',
    price: 179,
    image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=500',
    category: 'breakfast',
    isVeg: false,
    isSpicy: false,
    isAvailable: true,
    availableInAreas: [], // Global
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },

  // ==================== LUNCH (8 items) ====================
  {
    _id: '65a1b2c3d4e5f6a7b8c90007',
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice layered with tender chicken and exotic spices',
    price: 399,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500',
    category: 'lunch',
    isVeg: false,
    isSpicy: true,
    isAvailable: true,
    availableInAreas: [], // Global - signature dish
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90008',
    name: 'Special Mutton Biryani',
    description: 'Premium mutton biryani with saffron rice - Johar Town exclusive',
    price: 549,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500',
    category: 'lunch',
    isVeg: false,
    isSpicy: true,
    isAvailable: true,
    availableInAreas: [JOHAR_TOWN_ID], // Johar Town only
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90009',
    name: 'Vegetable Pulao',
    description: 'Fragrant rice cooked with seasonal vegetables and mild spices',
    price: 249,
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500',
    category: 'lunch',
    isVeg: true,
    isSpicy: false,
    isAvailable: true,
    availableInAreas: [], // Global
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90010',
    name: 'Butter Chicken',
    description: 'Creamy tomato-based curry with tender chicken pieces - a classic',
    price: 449,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500',
    category: 'lunch',
    isVeg: false,
    isSpicy: false,
    isAvailable: true,
    availableInAreas: [], // Global
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90011',
    name: 'Dal Makhani',
    description: 'Rich and creamy black lentils slow-cooked overnight',
    price: 299,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500',
    category: 'lunch',
    isVeg: true,
    isSpicy: false,
    isAvailable: true,
    availableInAreas: [], // Global
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90012',
    name: 'Karahi Chicken',
    description: 'Wok-tossed chicken with tomatoes, green chilies, and ginger',
    price: 499,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500',
    category: 'lunch',
    isVeg: false,
    isSpicy: true,
    isAvailable: true,
    availableInAreas: [GULBERG_ID, MODEL_TOWN_ID], // Gulberg & Model Town
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90013',
    name: 'Paneer Tikka Masala',
    description: 'Grilled cottage cheese in rich, spiced tomato gravy',
    price: 379,
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500',
    category: 'lunch',
    isVeg: true,
    isSpicy: true,
    isAvailable: true,
    availableInAreas: [], // Global
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90014',
    name: 'Fish Curry',
    description: 'Fresh river fish in tangy mustard curry - Bengali style',
    price: 449,
    image: 'https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=500',
    category: 'lunch',
    isVeg: false,
    isSpicy: true,
    isAvailable: true,
    availableInAreas: [DHA_ID, CAVALRY_ID], // DHA & Cavalry only
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },

  // ==================== DINNER (8 items) ====================
  {
    _id: '65a1b2c3d4e5f6a7b8c90015',
    name: 'Seekh Kebab Platter',
    description: 'Juicy minced beef kebabs grilled to perfection, served with naan',
    price: 549,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500',
    category: 'dinner',
    isVeg: false,
    isSpicy: true,
    isAvailable: true,
    availableInAreas: [], // Global
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90016',
    name: 'Mutton Korma',
    description: 'Tender mutton in rich yogurt and nut-based gravy',
    price: 649,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500',
    category: 'dinner',
    isVeg: false,
    isSpicy: false,
    isAvailable: true,
    availableInAreas: [], // Global
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90017',
    name: 'Chicken Tikka',
    description: 'Marinated boneless chicken pieces grilled in tandoor',
    price: 449,
    image: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=500',
    category: 'dinner',
    isVeg: false,
    isSpicy: true,
    isAvailable: true,
    availableInAreas: [], // Global
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90018',
    name: 'DHA Special BBQ Platter',
    description: 'Premium BBQ platter with tikka, kebab, and malai boti - DHA exclusive',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500',
    category: 'dinner',
    isVeg: false,
    isSpicy: true,
    isAvailable: true,
    availableInAreas: [DHA_ID], // DHA only
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90019',
    name: 'Palak Paneer',
    description: 'Cottage cheese cubes in creamy spinach gravy',
    price: 349,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500',
    category: 'dinner',
    isVeg: true,
    isSpicy: false,
    isAvailable: true,
    availableInAreas: [], // Global
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90020',
    name: 'Lamb Chops',
    description: 'Tender lamb chops marinated and grilled, served with mint sauce',
    price: 899,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500',
    category: 'dinner',
    isVeg: false,
    isSpicy: false,
    isAvailable: true,
    availableInAreas: [GULBERG_ID, DHA_ID, CAVALRY_ID], // Premium areas
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90021',
    name: 'Mixed Vegetable Curry',
    description: 'Seasonal vegetables in aromatic curry sauce',
    price: 249,
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=500',
    category: 'dinner',
    isVeg: true,
    isSpicy: true,
    isAvailable: true,
    availableInAreas: [], // Global
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90022',
    name: 'Chicken Handi',
    description: 'Boneless chicken cooked in clay pot with cream and spices',
    price: 549,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500',
    category: 'dinner',
    isVeg: false,
    isSpicy: true,
    isAvailable: true,
    availableInAreas: [], // Global
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },

  // ==================== DESSERTS (5 items) ====================
  {
    _id: '65a1b2c3d4e5f6a7b8c90023',
    name: 'Gulab Jamun',
    description: 'Deep-fried milk dumplings soaked in rose-flavored syrup (4 pcs)',
    price: 149,
    image: 'https://images.unsplash.com/photo-1666190094762-2b3c7e1f7bc2?w=500',
    category: 'desserts',
    isVeg: true,
    isSpicy: false,
    isAvailable: true,
    availableInAreas: [], // Global
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90024',
    name: 'Kheer',
    description: 'Traditional rice pudding with cardamom, nuts, and saffron',
    price: 179,
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500',
    category: 'desserts',
    isVeg: true,
    isSpicy: false,
    isAvailable: true,
    availableInAreas: [], // Global
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90025',
    name: 'Gajar Ka Halwa',
    description: 'Sweet carrot pudding with ghee, milk, and dry fruits',
    price: 199,
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500',
    category: 'desserts',
    isVeg: true,
    isSpicy: false,
    isAvailable: true,
    availableInAreas: [JOHAR_TOWN_ID, MODEL_TOWN_ID], // Winter special areas
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90026',
    name: 'Ras Malai',
    description: 'Soft cheese patties in sweet, thickened milk with pistachios',
    price: 229,
    image: 'https://images.unsplash.com/photo-1666190094762-2b3c7e1f7bc2?w=500',
    category: 'desserts',
    isVeg: true,
    isSpicy: false,
    isAvailable: true,
    availableInAreas: [], // Global
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90027',
    name: 'Jalebi with Rabri',
    description: 'Crispy spiral sweets served with thick sweetened milk',
    price: 199,
    image: 'https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=500',
    category: 'desserts',
    isVeg: true,
    isSpicy: false,
    isAvailable: true,
    availableInAreas: [], // Global
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },

  // ==================== BEVERAGES (6 items) ====================
  {
    _id: '65a1b2c3d4e5f6a7b8c90028',
    name: 'Mango Lassi',
    description: 'Refreshing yogurt drink blended with sweet mango pulp',
    price: 149,
    image: 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=500',
    category: 'beverages',
    isVeg: true,
    isSpicy: false,
    isAvailable: true,
    availableInAreas: [], // Global
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90029',
    name: 'Salted Lassi',
    description: 'Traditional savory yogurt drink with cumin and salt',
    price: 99,
    image: 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=500',
    category: 'beverages',
    isVeg: true,
    isSpicy: false,
    isAvailable: true,
    availableInAreas: [], // Global
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90030',
    name: 'Kashmiri Chai',
    description: 'Pink tea with cardamom, almonds, and pistachios',
    price: 179,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500',
    category: 'beverages',
    isVeg: true,
    isSpicy: false,
    isAvailable: true,
    availableInAreas: [], // Global
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90031',
    name: 'Fresh Lime Soda',
    description: 'Sparkling soda with fresh lime juice - sweet or salty',
    price: 79,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500',
    category: 'beverages',
    isVeg: true,
    isSpicy: false,
    isAvailable: true,
    availableInAreas: [], // Global
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90032',
    name: 'Rooh Afza Sharbat',
    description: 'Classic rose-flavored drink with basil seeds',
    price: 99,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500',
    category: 'beverages',
    isVeg: true,
    isSpicy: false,
    isAvailable: true,
    availableInAreas: [], // Global
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: '65a1b2c3d4e5f6a7b8c90033',
    name: 'Doodh Patti Chai',
    description: 'Strong milk tea - the Pakistani way',
    price: 69,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500',
    category: 'beverages',
    isVeg: true,
    isSpicy: false,
    isAvailable: false, // Currently unavailable
    availableInAreas: [], // Global
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
];

// Area ID to Name mapping - matches mockAreas.ts
export const AREA_NAMES: Record<string, string> = {
  [GULBERG_ID]: 'Gulberg',
  [DHA_ID]: 'DHA Phase 5',
  [JOHAR_TOWN_ID]: 'Johar Town',
  [MODEL_TOWN_ID]: 'Model Town',
  [BAHRIA_ID]: 'Bahria Town',
  [GARDEN_TOWN_ID]: 'Garden Town',
  [FAISAL_TOWN_ID]: 'Faisal Town',
  [CAVALRY_ID]: 'Cavalry Ground',
};

// Get all active area IDs
export const ACTIVE_AREA_IDS = [
  GULBERG_ID,
  DHA_ID,
  JOHAR_TOWN_ID,
  MODEL_TOWN_ID,
  GARDEN_TOWN_ID,
  CAVALRY_ID,
];

// Get menu filtered by area ID (simulates backend logic exactly)
export function getMenuByAreaId(areaId: string): MenuItem[] {
  return mockMenuItems.filter(item => {
    if (!item.isAvailable) return false;
    // Global items (empty array) OR includes this specific area
    return item.availableInAreas.length === 0 || item.availableInAreas.includes(areaId);
  });
}

// Get all available menu items (for full catalog)
export function getAllAvailableMenuItems(): MenuItem[] {
  return mockMenuItems.filter(item => item.isAvailable);
}
