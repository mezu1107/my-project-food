// src/features/menu/pages/Menu.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { useStore } from '@/lib/store';
import { useCartStore } from '@/features/cart/store/useCartStore';
import { useMenuByLocation } from '@/features/menu/hooks/useMenuApi';
import { MenuHeader } from '@/features/menu/components/MenuHeader';
import { MenuFilters } from '@/features/menu/components/MenuFilters';
import { MenuItemCard } from '@/features/menu/components/MenuItemCard';
import { MenuPageSkeleton } from '@/features/menu/components/MenuSkeleton';
import { CATEGORY_LABELS, type MenuCategory, type MenuItem } from '@/features/menu/types/menu.types';

export default function MenuPage() {
  const navigate = useNavigate();
  const { userLocation, selectedArea } = useStore();
  const { getItemCount, subtotal } = useCartStore();
  const itemCount = getItemCount();

  // Redirect if no location
  useEffect(() => {
    if (!userLocation && !selectedArea) {
      navigate('/', { replace: true });
    }
  }, [userLocation, selectedArea, navigate]);

  const { data, isLoading, error } = useMenuByLocation(
    userLocation?.lat ?? null,
    userLocation?.lng ?? null
  );

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [isVeg, setIsVeg] = useState<boolean | null>(null);
  const [isSpicy, setIsSpicy] = useState<boolean | null>(null);

  // Current area ID from either location check or selected area
  const currentAreaId = data?.area?._id ?? selectedArea?.id ?? null;

  const filteredItems = useMemo(() => {
    if (!data?.menu) return [];

    return data.menu.filter((item) => {
      // Always respect availability
      if (!item.isAvailable) return false;

      // Area restriction: show if item is global OR explicitly allowed in current area
      const isGlobal = !item.availableInAreas || item.availableInAreas.length === 0;
      const isAllowedInArea = currentAreaId ? item.availableInAreas?.includes(currentAreaId) : false;
      if (!isGlobal && !isAllowedInArea) return false;

      // Search
      if (search) {
        const q = search.toLowerCase().trim();
        if (
          !item.name.toLowerCase().includes(q) &&
          !(item.description || '').toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      // Filters
      if (selectedCategory && item.category !== selectedCategory) return false;
      if (isVeg !== null && item.isVeg !== isVeg) return false;
      if (isSpicy !== null && item.isSpicy !== isSpicy) return false;

      return true;
    });
  }, [data?.menu, search, selectedCategory, isVeg, isSpicy, currentAreaId]);

  const groupedItems = useMemo<Record<MenuCategory, MenuItem[]>>(() => {
    const groups: Record<MenuCategory, MenuItem[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      desserts: [],
      beverages: [],
    };

    filteredItems.forEach((item) => {
      groups[item.category].push(item);
    });

    return groups;
  }, [filteredItems]);

  if (isLoading) return <MenuPageSkeleton />;

  if (error || !data?.inService) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6">
        <p className="text-2xl font-semibold text-destructive">
          {data?.message || "We don't deliver to your location yet"}
        </p>
        <Button onClick={() => navigate('/')} size="lg">
          Change Location
        </Button>
      </div>
    );
  }

  const areaName = data.area?.name ?? selectedArea?.name ?? 'Your Area';
  const city = data.area?.city ?? selectedArea?.city ?? 'Pakistan';

  return (
    <div className="min-h-screen bg-background pb-32">
      <MenuHeader
        areaName={areaName}
        city={city}
        deliveryFee={data.delivery?.fee ?? 149}
        estimatedTime={data.delivery?.estimatedTime ?? '35-50 min'}
        onChangeLocation={() => navigate('/')}
      />

      <div className="container mx-auto px-4 py-6">
        <MenuFilters
          search={search}
          onSearchChange={setSearch}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          isVeg={isVeg}
          onVegChange={setIsVeg}
          isSpicy={isSpicy}
          onSpicyChange={setIsSpicy}
        />

        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-muted/50 rounded-lg">
            <p className="text-xl text-muted-foreground mb-6">
              No items match your filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setSelectedCategory(null);
                setIsVeg(null);
                setIsSpicy(null);
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : selectedCategory ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <MenuItemCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <div className="space-y-16">
            {(Object.keys(groupedItems) as MenuCategory[]).map((cat) => {
              const items = groupedItems[cat];
              if (items.length === 0) return null;

              return (
                <section key={cat}>
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    {CATEGORY_LABELS[cat]}
                    <Badge variant="secondary" className="text-lg px-3">
                      {items.length}
                    </Badge>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item) => (
                      <MenuItemCard key={item._id} item={item} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart Button */}
      {itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-6 px-4 z-50">
          <div className="max-w-lg mx-auto">
            <Button
              onClick={() => navigate('/cart')}
              size="lg"
              className="w-full h-16 text-lg font-bold shadow-2xl rounded-xl bg-gradient-to-r from-green-600 to-emerald-600"
            >
              <div className="flex items-center justify-between w-full px-6">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-6 w-6" />
                  <span>{itemCount} item{itemCount > 1 ? 's' : ''}</span>
                </div>
                <span>Rs. {subtotal}</span>
              </div>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}