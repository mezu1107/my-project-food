import { Plus, Leaf, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/features/cart/store/useCartStore';
import { toast } from 'sonner';
import type { MenuItem } from '../types/menu.types';

interface MenuItemCardProps {
  item: MenuItem;
  className?: string; // ✅ allow custom classes
}

export function MenuItemCard({ item, className = "" }: MenuItemCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      id: item._id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    });
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <Card className={`group overflow-hidden card-elegant bg-card border-border/50 ${className}`}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {item.isVeg && (
            <Badge className="bg-accent text-accent-foreground text-xs px-1.5 py-0.5">
              <Leaf className="h-3 w-3 mr-0.5" />
              Veg
            </Badge>
          )}
          {item.isSpicy && (
            <Badge className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5">
              <Flame className="h-3 w-3 mr-0.5" />
              Spicy
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground line-clamp-1">{item.name}</h3>
          <span className="font-bold text-primary whitespace-nowrap">
            Rs. {item.price}
          </span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {item.description}
        </p>

        <Button
          onClick={handleAddToCart}
          className="w-full gap-2 bg-primary hover:bg-primary/90"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}
