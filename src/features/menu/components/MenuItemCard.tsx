// src/components/menu/MenuItemCard.tsx
// PRODUCTION-READY — Integrates with AddToCartModal for full customization

import { useState } from 'react';
import { Leaf, Flame } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { AddToCartModal } from '@/features/cart/components/AddToCartModal';

import type { MenuItem } from '@/features/menu/types/menu.types';

interface MenuItemCardProps {
  item: MenuItem;
  className?: string;
}

export function MenuItemCard({ item, className = '' }: MenuItemCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  // Safe rendering helpers
  const safeName = String(item.name || 'Unnamed Item');
  const safeDescription = String(item.description || 'Delicious item from our menu');
  const safePrice = Number(item.price || 0);
  const safeImage = item.image || '/placeholder-food.jpg';

  const handleOpenCustomization = () => {
    if (!item.isAvailable) return;
    setModalOpen(true);
  };

  return (
    <>
      <Card
        className={`group overflow-hidden bg-card border-border/50 cursor-pointer transition-all hover:shadow-lg ${className} ${
          !item.isAvailable ? 'opacity-60' : ''
        }`}
        onClick={handleOpenCustomization}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={safeImage}
            alt={safeName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {item.isVeg && (
              <Badge variant="secondary" className="text-xs px-2.5 py-1 shadow-md">
                <Leaf className="h-3.5 w-3.5 mr-1" />
                Veg
              </Badge>
            )}
            {item.isSpicy && (
              <Badge variant="destructive" className="text-xs px-2.5 py-1 shadow-md">
                <Flame className="h-3.5 w-3.5 mr-1" />
                Spicy
              </Badge>
            )}
            {!item.isAvailable && (
              <Badge variant="secondary" className="bg-gray-600 text-white text-xs px-3 py-1 shadow-md">
                Unavailable
              </Badge>
            )}
          </div>

          {/* Price tag */}
          <div className="absolute bottom-3 right-3">
            <Badge variant="default" className="text-base font-bold px-4 py-2 shadow-lg">
              Rs. {safePrice.toLocaleString()}
            </Badge>
          </div>
        </div>

        <CardContent className="p-5">
          <h3 className="font-bold text-xl mb-2 line-clamp-1">{safeName}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {safeDescription}
          </p>

          <Button
            className="w-full"
            size="lg"
            disabled={!item.isAvailable}
            variant={item.isAvailable ? "default" : "secondary"}
          >
            {item.isAvailable ? 'Customize & Add' : 'Currently Unavailable'}
          </Button>
        </CardContent>
      </Card>

      {/* Customization Modal */}
      <AddToCartModal
        menuItemId={item._id}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}