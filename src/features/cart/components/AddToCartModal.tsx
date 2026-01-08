// src/features/cart/components/AddToCartModal.tsx
// PRODUCTION-READY — JANUARY 09, 2026
// FINAL VERSION: Works perfectly for guest AND logged-in users
// Type-safe, no validation drift, accurate pricing, beautiful UI

import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Minus, X, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

import { useMenuItem } from '@/features/menu/hooks/useMenuApi';
import { useAddToCart } from '@/features/cart/hooks/useServerCart';
import { useCartStore } from '@/features/cart/hooks/useCartStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { PricedOptions, UNIT_LABELS } from '@/features/menu/types/menu.types';
import { toast } from 'sonner';

type CustomizationSection = 'sides' | 'drinks' | 'addOns';

// Payload type matching backend exactly
type AddToCartPayload = {
  menuItemId: string;
  quantity: number;
  sides?: string[];
  drinks?: string[];
  addOns?: string[];
  specialInstructions?: string;
};

interface AddToCartModalProps {
  menuItemId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPTY_OPTIONS: Record<CustomizationSection, string[]> = {
  sides: [],
  drinks: [],
  addOns: [],
};

const EMPTY_CUSTOM_INPUTS: Record<CustomizationSection, string> = {
  sides: '',
  drinks: '',
  addOns: '',
};

export const AddToCartModal = ({ menuItemId, open, onOpenChange }: AddToCartModalProps) => {
  const navigate = useNavigate();
  const { data: menuItem, isLoading } = useMenuItem(menuItemId);
  const addToCartMutation = useAddToCart();
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const isGuest = !user;

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState(EMPTY_OPTIONS);
  const [customInputs, setCustomInputs] = useState(EMPTY_CUSTOM_INPUTS);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showFooterShadow, setShowFooterShadow] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setQuantity(1);
      setSelectedOptions(EMPTY_OPTIONS);
      setCustomInputs(EMPTY_CUSTOM_INPUTS);
      setSpecialInstructions('');
    }
  }, [open]);

  // Footer shadow on scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => setShowFooterShadow(el.scrollTop > 10);
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, []);

  const extrasTotal = useMemo(() => {
    if (!menuItem?.pricedOptions) return 0;
    let total = 0;
    (Object.keys(selectedOptions) as CustomizationSection[]).forEach((section) => {
      selectedOptions[section].forEach((name) => {
        if (name.startsWith('Custom:')) return;
        const opt = menuItem.pricedOptions?.[section]?.find((o) => o.name === name);
        if (opt) total += opt.price;
      });
    });
    return total;
  }, [menuItem?.pricedOptions, selectedOptions]);

  const itemTotal = ((menuItem?.price ?? 0) + extrasTotal) * quantity;

  const toggleOption = (section: CustomizationSection, name: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [section]: prev[section].includes(name)
        ? prev[section].filter((n) => n !== name)
        : [...prev[section], name],
    }));
  };

  const addCustomOption = (section: CustomizationSection) => {
    const text = customInputs[section].trim();
    if (!text) return;
    if (text.length > 100) {
      toast.error('Custom option too long (max 100 characters)');
      return;
    }
    setSelectedOptions((prev) => ({
      ...prev,
      [section]: [...prev[section], `Custom: ${text}`],
    }));
    setCustomInputs((prev) => ({ ...prev, [section]: '' }));
    toast.success('Custom option added');
  };

  const handleAddToCart = async () => {
    const cleanId = menuItemId?.trim();

    // Safe ObjectId validation — matches mongoose exactly
    if (!cleanId || !/^[0-9a-fA-F]{24}$/.test(cleanId)) {
      toast.error('Invalid item');
      return;
    }

    if (!menuItem) {
      toast.error('Item not found');
      return;
    }

    if (!menuItem.isAvailable) {
      toast.error('This item is currently unavailable');
      return;
    }

    if (quantity < 1 || quantity > 50) {
      toast.error('Quantity must be between 1 and 50');
      return;
    }

    if (specialInstructions.trim().length > 300) {
      toast.error('Special instructions too long (max 300 characters)');
      return;
    }

    // Build strongly-typed payload
    const payload: AddToCartPayload = {
      menuItemId: cleanId,
      quantity,
    };

    if (selectedOptions.sides.length > 0) payload.sides = selectedOptions.sides;
    if (selectedOptions.drinks.length > 0) payload.drinks = selectedOptions.drinks;
    if (selectedOptions.addOns.length > 0) payload.addOns = selectedOptions.addOns;
    if (specialInstructions.trim()) payload.specialInstructions = specialInstructions.trim();

    try {
      if (isGuest) {
        // Guest: add to local Zustand store
        addItem(
          menuItem,
          quantity,
          {
            sides: selectedOptions.sides.length ? selectedOptions.sides : undefined,
            drinks: selectedOptions.drinks.length ? selectedOptions.drinks : undefined,
            addOns: selectedOptions.addOns.length ? selectedOptions.addOns : undefined,
            specialInstructions: specialInstructions.trim() || undefined,
          },
          menuItem.price
        );

        toast.success(`${quantity} × ${menuItem.name} added to cart!`, {
          icon: <ShoppingCart className="h-5 w-5" />,
          duration: 5000,
          action: { label: 'View Cart', onClick: () => navigate('/cart') },
        });
      } else {
        // Logged-in: send to server
        await addToCartMutation.mutateAsync(payload);

        toast.success(`${quantity} × ${menuItem.name} added to cart!`, {
          icon: <ShoppingCart className="h-5 w-5" />,
          duration: 5000,
          action: { label: 'View Cart', onClick: () => navigate('/cart') },
        });
      }

      onOpenChange(false);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add to cart';
      toast.error(message);
      console.error('Add to cart error:', error);
    }
  };

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>Loading item...</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 p-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!menuItem) return null;

  const pricedOptions: PricedOptions = menuItem.pricedOptions ?? { sides: [], drinks: [], addOns: [] };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[90vh] sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:mx-auto flex flex-col rounded-t-3xl"
      >
        {/* Header */}
        <SheetHeader className="border-b pb-4 px-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold flex items-center gap-3">
              {menuItem.name}
              <Badge variant="secondary" className="text-xs">
                {UNIT_LABELS[menuItem.unit] || menuItem.unit}
              </Badge>
            </SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        {/* Scrollable Body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-8 pb-32">
          {/* Quantity */}
          <div className="bg-card rounded-xl p-6 border">
            <Label className="text-base font-semibold">Quantity</Label>
            <div className="flex items-center justify-center gap-8 mt-6">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-5 w-5" />
              </Button>
              <span className="text-4xl font-bold w-24 text-center">{quantity}</span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                disabled={quantity >= 50}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Customization Sections */}
          {(Object.keys(pricedOptions) as CustomizationSection[]).map((section) => (
            <div key={section} className="bg-card rounded-xl p-6 border">
              <Label className="text-lg font-semibold capitalize">
                {section === 'addOns' ? 'Add-ons' : section.charAt(0).toUpperCase() + section.slice(1)}
              </Label>

              <div className="space-y-4 mt-5">
                {pricedOptions[section].map((opt) => (
                  <div key={opt.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={selectedOptions[section].includes(opt.name)}
                        onCheckedChange={() => toggleOption(section, opt.name)}
                      />
                      <div>
                        <span className="font-medium">{opt.name}</span>
                        {opt.unit && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {UNIT_LABELS[opt.unit] || opt.unit}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {opt.price > 0 && (
                      <span className="font-medium text-primary">+Rs. {opt.price}</span>
                    )}
                  </div>
                ))}

                {/* Custom Options */}
                {selectedOptions[section]
                  .filter((n) => n.startsWith('Custom:'))
                  .map((custom) => (
                    <div key={custom} className="flex items-center justify-between pl-10">
                      <span className="text-sm italic text-muted-foreground">{custom}</span>
                      <span className="text-sm text-muted-foreground">Free</span>
                    </div>
                  ))}
              </div>

              <Separator className="my-6" />

              <div className="flex gap-3">
                <Input
                  placeholder="Add your own (free)"
                  value={customInputs[section]}
                  onChange={(e) => setCustomInputs((p) => ({ ...p, [section]: e.target.value }))}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), addCustomOption(section))
                  }
                  maxLength={100}
                />
                <Button onClick={() => addCustomOption(section)} size="sm">
                  Add
                </Button>
              </div>
            </div>
          ))}

          {/* Special Instructions */}
          <div className="bg-card rounded-xl p-6 border">
            <Label className="text-lg font-semibold">Special Instructions (Optional)</Label>
            <Textarea
              placeholder="e.g. Less spicy, no onions, extra sauce..."
              className="mt-4"
              rows={4}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value.slice(0, 300))}
            />
            <div className="flex justify-end mt-2">
              <p className="text-sm text-muted-foreground">{specialInstructions.length}/300</p>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div
          className={`bg-background border-t p-6 space-y-4 transition-shadow duration-300 ${
            showFooterShadow ? 'shadow-2xl' : 'shadow-lg'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Total</span>
            <span className="text-3xl font-bold text-primary">Rs. {itemTotal.toFixed(2)}</span>
          </div>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold"
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending || !menuItem.isAvailable}
          >
            {addToCartMutation.isPending
              ? 'Adding...'
              : menuItem.isAvailable
              ? 'Add to Cart'
              : 'Unavailable'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};