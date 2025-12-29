// src/components/menu/MenuItemCard.tsx
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

const UNIT_LABELS: Record<string, string> = {
  pc: 'per piece',
  kg: 'per kg',
  g: 'g',
  ml: 'ml',
  liter: 'liter',
  bottle: 'bottle',
  slice: 'slice',
  cup: 'cup',
  pack: 'pack',
  dozen: 'dozen',
  tray: 'tray',
};

export function MenuItemCard({ item, className = '' }: MenuItemCardProps) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const isAvailable = item.isAvailable !== false;

  const unitDisplay = UNIT_LABELS[item.unit] || item.unit;

  const handleCardClick = () => {
    if (isAvailable) setModalOpen(true);
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isAvailable) setModalOpen(true);
  };

  return (
    <>
      <Card
        className={`
          group relative overflow-hidden bg-card border transition-all
          hover:shadow-xl
          ${!isAvailable ? 'opacity-60 grayscale' : 'cursor-pointer'}
          ${className}
        `}
        onClick={handleCardClick}
        role="button"
        tabIndex={isAvailable ? 0 : -1}
        aria-disabled={!isAvailable}
        aria-label={`View details for ${item.name}${!isAvailable ? ' (unavailable)' : ''}`}
        onKeyDown={(e) => {
          if (isAvailable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setModalOpen(true);
          }
        }}
      >
        {/* Image */}
        <div className="relative w-full overflow-hidden rounded-lg bg-muted aspect-[4/3] md:aspect-[16/9] lg:aspect-[4/3]">
          <img
            src={item.image || '/placeholder-food.jpg'}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {item.isVeg && (
              <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium shadow-md">
                <Leaf className="h-3.5 w-3.5" />
                Veg
              </Badge>
            )}
            {item.isSpicy && (
              <Badge variant="destructive" className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium shadow-md">
                <Flame className="h-3.5 w-3.5" />
                Spicy
              </Badge>
            )}
            {!isAvailable && (
              <Badge className="bg-black/80 text-white px-3 py-1.5 text-xs font-medium shadow-md">
                Unavailable
              </Badge>
            )}
          </div>

          {/* Price + Unit Badge */}
          <div className="absolute bottom-4 right-4">
            <Badge
              variant="default"
              className="text-base sm:text-lg md:text-xl font-bold px-4 sm:px-5 py-2 sm:py-2.5 shadow-2xl backdrop-blur-sm bg-primary/90 flex flex-col items-end leading-tight"
            >
              <span>Rs. {Number(item.price).toLocaleString('en-IN')}</span>
              <span className="text-xs font-normal opacity-90 mt-0.5">
                {unitDisplay}
              </span>
            </Badge>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4 sm:p-6">
          <h3 className="font-bold text-[clamp(1rem,2.5vw,1.25rem)] sm:text-[clamp(1.125rem,2.5vw,1.5rem)] mb-2 line-clamp-2">
            {item.name}
          </h3>

          {item.description && (
            <p className="text-[clamp(0.75rem,2vw,0.875rem)] sm:text-[clamp(0.875rem,2vw,1rem)] text-muted-foreground line-clamp-3 mb-4 sm:mb-6">
              {item.description}
            </p>
          )}

          <Button
            className="w-full touch-manipulation"
            size="lg"
            variant={isAvailable ? 'default' : 'secondary'}
            disabled={!isAvailable}
            onClick={handleButtonClick}
          >
            {isAvailable ? 'Customize & Add to Cart' : 'Currently Unavailable'}
          </Button>
        </CardContent>
      </Card>

      <AddToCartModal
        menuItemId={item._id}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}