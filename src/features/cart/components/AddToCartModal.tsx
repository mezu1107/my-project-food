// src/features/cart/components/AddToCartModal.tsx
// PRODUCTION-READY — DECEMBER 26, 2025
// Full customization modal with real-time pricing, mobile bottom sheet, free-text + predefined options

import { useEffect, useMemo, useState } from 'react';
import { Plus, Minus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

import { useMenuItem } from '@/features/menu/hooks/useMenuApi';
import { useAddToCart } from '@/features/cart/hooks/useServerCart';
import { PricedOptions } from '@/features/menu/types/menu.types';
import { toast } from 'sonner';

type CustomizationSection = 'sides' | 'drinks' | 'addOns';

interface AddToCartModalProps {
  menuItemId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddToCartModal = ({ menuItemId, open, onOpenChange }: AddToCartModalProps) => {
  const { data: menuItem, isLoading } = useMenuItem(menuItemId);
  const addToCart = useAddToCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<CustomizationSection, string[]>>({
    sides: [],
    drinks: [],
    addOns: [],
  });
  const [customInputs, setCustomInputs] = useState<Record<CustomizationSection, string>>({
    sides: '',
    drinks: '',
    addOns: '',
  });
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [orderNote, setOrderNote] = useState('');

  // Real-time price calculation
  const extrasTotal = useMemo(() => {
    if (!menuItem?.pricedOptions) return 0;
    const { pricedOptions } = menuItem;

    let total = 0;
    (['sides', 'drinks', 'addOns'] as CustomizationSection[]).forEach((section) => {
      selectedOptions[section].forEach((name) => {
        const option = pricedOptions[section]?.find((opt) => opt.name === name);
        if (option) total += option.price;
      });
    });
    return total;
  }, [selectedOptions, menuItem?.pricedOptions]);

  const itemTotal = ((menuItem?.price || 0) + extrasTotal) * quantity;

  const toggleOption = (section: CustomizationSection, name: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [section]: prev[section].includes(name)
        ? prev[section].filter((n) => n !== name)
        : [...prev[section], name],
    }));
  };

  const addCustom = (section: CustomizationSection) => {
    const text = customInputs[section].trim();
    if (!text) return;

    setSelectedOptions((prev) => ({
      ...prev,
      [section]: [...prev[section], `Custom: ${text}`],
    }));
    setCustomInputs((prev) => ({ ...prev, [section]: '' }));
    toast.success(`Custom ${section.slice(0, -1)} added`);
  };

  const handleAddToCart = () => {
    if (quantity < 1) {
      toast.error('Please select at least 1 quantity');
      return;
    }

    addToCart.mutate(
      {
        menuItemId,
        quantity,
        sides: selectedOptions.sides,
        drinks: selectedOptions.drinks,
        addOns: selectedOptions.addOns,
        specialInstructions: specialInstructions.trim() || undefined,
        orderNote: orderNote.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(`${menuItem?.name} added to cart!`);
          onOpenChange(false);
        },
        onError: () => {
          toast.error('Failed to add item. Please try again.');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Loading item...</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 py-8">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!menuItem) {
    toast.error('Menu item not found');
    onOpenChange(false);
    return null;
  }

  const pricedOptions: PricedOptions = menuItem.pricedOptions || { sides: [], drinks: [], addOns: [] };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:mx-auto sm:rounded-t-3xl">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold">{menuItem.name}</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 py-6">
          <div className="space-y-8 pb-20 sm:pb-8">
            {/* Quantity */}
            <div className="bg-card rounded-xl p-4 border">
              <Label className="text-base font-semibold">How many would you like?</Label>
              <div className="flex items-center justify-center gap-6 mt-4">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-3xl font-bold w-20 text-center">{quantity}</span>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setQuantity(Math.min(50, quantity + 1))}
                  disabled={quantity >= 50}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Sides, Drinks, Add-ons */}
            {(['sides', 'drinks', 'addOns'] as const).map((section) => (
              <div key={section} className="bg-card rounded-xl p-6 border">
                <Label className="text-base font-semibold capitalize mb-4 block">
                  {section === 'addOns' ? 'Add-ons' : section}
                </Label>

                <div className="space-y-3">
                  {pricedOptions[section]?.map((opt) => (
                    <div key={opt.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedOptions[section].includes(opt.name)}
                          onCheckedChange={() => toggleOption(section, opt.name)}
                        />
                        <span>{opt.name}</span>
                      </div>
                      {opt.price > 0 && <span className="text-sm font-medium">+Rs. {opt.price}</span>}
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex gap-2">
                  <Input
                    placeholder="Type your own (free)"
                    value={customInputs[section]}
                    onChange={(e) =>
                      setCustomInputs((prev) => ({ ...prev, [section]: e.target.value }))
                    }
                    onKeyDown={(e) => e.key === 'Enter' && addCustom(section)}
                  />
                  <Button onClick={() => addCustom(section)}>Add</Button>
                </div>
              </div>
            ))}

            {/* Special Instructions */}
            <div className="bg-card rounded-xl p-6 border">
              <Label className="text-base font-semibold">Any special instructions?</Label>
              <Textarea
                placeholder="e.g., Less spicy, no onions, extra sauce..."
                className="mt-3"
                rows={3}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value.slice(0, 300))}
              />
              <p className="text-xs text-muted-foreground mt-2 text-right">
                {specialInstructions.length}/300
              </p>
            </div>

            {/* Order Note */}
            <div className="bg-card rounded-xl p-6 border">
              <Label className="text-base font-semibold">Order note (for entire order)</Label>
              <Textarea
                placeholder="e.g., Please deliver quickly, call on arrival"
                className="mt-3"
                rows={3}
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value.slice(0, 500))}
              />
              <p className="text-xs text-muted-foreground mt-2 text-right">
                {orderNote.length}/500
              </p>
            </div>
          </div>
        </ScrollArea>

        {/* Fixed Footer */}
        <div className="sticky bottom-0 bg-background border-t p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Total</span>
            <span className="text-2xl font-bold text-primary">Rs. {itemTotal.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => onOpenChange(false)}
              disabled={addToCart.isPending}
            >
              Skip & Continue
            </Button>
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={addToCart.isPending || quantity < 1}
            >
              {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};