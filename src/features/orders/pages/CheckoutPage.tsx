// src/features/orders/pages/CheckoutPage.tsx
// FINAL PRODUCTION — DECEMBER 26, 2025
// Fully synced with backend: sends priceAtAdd + full customizations
// Uses low-level hooks from useOrders.ts correctly
// Zero TypeScript errors

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Loader2,
  AlertCircle,
  MapPin,
  User,
  CreditCard,
  Wallet,
  Building2,
  Smartphone,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useCartStore } from '@/features/cart/hooks/useCartStore';
import { useAddresses } from '@/features/address/hooks/useAddresses';
import { useAreas } from '@/hooks/useCheckArea';
import { useCreateOrder, useCreateGuestOrder } from '@/features/orders/hooks/useOrders';

const checkoutSchema = z.object({
  paymentMethod: z.enum(['cash', 'card', 'easypaisa', 'jazzcash', 'bank', 'wallet'], {
    required_error: 'Please select a payment method',
  }),
  useWallet: z.boolean().optional().default(true),
  promoCode: z.string().optional(),
  instructions: z.string().max(300).optional(),

  // Authenticated
  addressId: z.string().optional(),

  // Guest only
  name: z.string().min(2, 'Name is required').optional(),
  phone: z.string().regex(/^03\d{9}$/, 'Invalid format: 03XXXXXXXXX').optional(),
  guestAddress: z
    .object({
      fullAddress: z.string().min(10, 'Full address required'),
      areaId: z.string({ required_error: 'Select delivery area' }),
      label: z.string().optional(),
      floor: z.string().optional(),
      instructions: z.string().max(150).optional(),
    })
    .optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const navigate = useNavigate();

  const { isAuthenticated } = useAuthStore();
  const { items, getTotal, orderNote } = useCartStore();

  const { data: addresses = [], isLoading: addressesLoading } = useAddresses();
  const { data: areas = [] } = useAreas();

  const createOrder = useCreateOrder();
  const createGuestOrder = useCreateGuestOrder();

  const [deliveryFee, setDeliveryFee] = useState(0);
  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState('35-50 min');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'cash',
      useWallet: true,
      instructions: orderNote || '',
    },
  });

  const subtotal = getTotal();
  const total = useMemo(() => subtotal + deliveryFee, [subtotal, deliveryFee]);
  const isMinOrderMet = subtotal >= minOrderAmount;

  const selectedAddressId = watch('addressId');
  const guestAreaId = watch('guestAddress.areaId');
  const guestFullAddress = watch('guestAddress.fullAddress');
  const guestLabel = watch('guestAddress.label') || 'Home';
  const guestFloor = watch('guestAddress.floor');
  const guestInstructions = watch('guestAddress.instructions');

  // Redirect if cart empty
  useEffect(() => {
    if (items.length === 0) {
      toast.info('Your cart is empty');
      navigate('/cart', { replace: true });
    }
  }, [items.length, navigate]);

  // Auto-select default address + delivery info (authenticated)
  useEffect(() => {
    if (!isAuthenticated || addresses.length === 0) return;

    const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
    if (defaultAddr && !selectedAddressId) {
      setValue('addressId', defaultAddr._id);

      const area = areas.find((a) => a._id === defaultAddr.area?._id);
      if (area?.deliveryZone) {
        setDeliveryFee(area.deliveryZone.deliveryFee ?? 149);
        setMinOrderAmount(area.deliveryZone.minOrderAmount ?? 0);
        setEstimatedTime(area.deliveryZone.estimatedTime || '35-50 min');
      }
    }
  }, [addresses, areas, isAuthenticated, selectedAddressId, setValue]);

  // Guest area selection update
  useEffect(() => {
    if (isAuthenticated || !guestAreaId) return;

    const area = areas.find((a) => a._id === guestAreaId);
    if (area?.deliveryZone) {
      setDeliveryFee(area.deliveryZone.deliveryFee ?? 149);
      setMinOrderAmount(area.deliveryZone.minOrderAmount ?? 0);
      setEstimatedTime(area.deliveryZone.estimatedTime || '35-50 min');
    }
  }, [guestAreaId, areas, isAuthenticated]);

  // Clear addressId when in guest mode
  useEffect(() => {
    if (!isAuthenticated) {
      resetField('addressId');
    }
  }, [isAuthenticated, resetField]);

  const canProceed =
    isMinOrderMet &&
    (isAuthenticated ? !!selectedAddressId : !!guestAreaId && !!guestFullAddress?.trim());

  const onSubmit = async (data: CheckoutForm) => {
    if (!canProceed) {
      toast.error('Please complete all required fields and meet minimum order amount');
      return;
    }

    // Build full items payload from cart store — includes priceAtAdd + customizations
    const itemsPayload = items.map((item) => ({
      menuItem: item.menuItem._id,
      quantity: item.quantity,
      priceAtAdd: item.priceAtAdd, // ← REQUIRED: includes extras
      sides: item.sides || [],
      drinks: item.drinks || [],
      addOns: item.addOns || [],
      specialInstructions: item.specialInstructions || '',
    }));

    try {
      let response;

      if (isAuthenticated) {
        if (!selectedAddressId) throw new Error('Please select a delivery address');

        response = await createOrder.mutateAsync({
          items: itemsPayload,
          addressId: selectedAddressId,
          paymentMethod: data.paymentMethod,
          useWallet: data.useWallet ?? true,
          promoCode: data.promoCode?.trim().toUpperCase() || undefined,
          instructions: data.instructions?.trim() || undefined,
        });
      } else {
        if (!data.guestAddress || !data.name || !data.phone) {
          throw new Error('Please fill all contact and address details');
        }

        response = await createGuestOrder.mutateAsync({
          items: itemsPayload,
          guestAddress: {
            fullAddress: data.guestAddress.fullAddress.trim(),
            areaId: data.guestAddress.areaId,
            label: data.guestAddress.label?.trim() || 'Home',
            floor: data.guestAddress.floor?.trim(),
            instructions: data.guestAddress.instructions?.trim(),
          },
          name: data.name.trim(),
          phone: data.phone.trim(),
          paymentMethod: data.paymentMethod,
          promoCode: data.promoCode?.trim().toUpperCase() || undefined,
          instructions: data.instructions?.trim() || undefined,
        });
      }

      // Handle payment flows
      if (response.clientSecret) {
        navigate('/checkout/card', {
          state: {
            clientSecret: response.clientSecret,
            orderId: response.order._id,
            amount: response.order.finalAmount,
          },
          replace: true,
        });
      } else if (response.bankDetails) {
        navigate('/checkout/bank-transfer', {
          state: {
            order: response.order,
            bankDetails: response.bankDetails,
          },
          replace: true,
        });
      } else {
        toast.success('Order placed successfully! 🎉');
        navigate(`/track/${response.order._id}`, { replace: true });
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          'Failed to place order. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background py-8 pb-20">
      <div className="container mx-auto max-w-6xl px-4">
        <h1 className="text-4xl font-bold text-center mb-10">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest Contact */}
            {!isAuthenticated && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input {...register('name')} placeholder="Ahmad Khan" />
                    {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input {...register('phone')} placeholder="03451234567" />
                    {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {estimatedTime && (
                  <CardDescription className="text-base">
                    Estimated delivery: <strong>{estimatedTime}</strong>
                  </CardDescription>
                )}

                {isAuthenticated ? (
                  addressesLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : addresses.length > 0 ? (
                    <Controller
                      name="addressId"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select saved address" />
                          </SelectTrigger>
                          <SelectContent>
                            {addresses.map((addr) => (
                              <SelectItem key={addr._id} value={addr._id}>
                                <div className="space-y-1">
                                  <div className="font-medium">{addr.label}</div>
                                  <div className="text-sm text-muted-foreground">{addr.fullAddress}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No saved addresses</AlertTitle>
                      <AlertDescription>
                        Add an address to continue.
                        <Button variant="link" className="p-0 ml-2" onClick={() => navigate('/addresses')}>
                          Add now
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )
                ) : (
                  <div className="space-y-6">
                    <div>
                      <Label>Delivery Area *</Label>
                      <Controller
                        name="guestAddress.areaId"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select area" />
                            </SelectTrigger>
                            <SelectContent>
                              {areas.map((area) => (
                                <SelectItem key={area._id} value={area._id}>
                                  <div>
                                    <div className="font-medium">{area.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      Fee: Rs. {area.deliveryZone?.deliveryFee || 149}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.guestAddress?.areaId && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.guestAddress.areaId.message}
                        </p>
                      )}
                    </div>

                    {/* Live Preview */}
                    {guestAreaId && guestFullAddress && (
                      <div className="p-5 border rounded-xl bg-card shadow-sm">
                        <div className="font-semibold text-lg mb-1">{guestLabel}</div>
                        <div className="text-base">{guestFullAddress}</div>
                        {guestFloor && <div className="text-sm text-muted-foreground mt-1">Floor: {guestFloor}</div>}
                        {guestInstructions && (
                          <div className="text-sm italic text-muted-foreground mt-3 border-t pt-3">
                            Note: "{guestInstructions}"
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-5">
                      <div>
                        <Label htmlFor="guest-fullAddress">Full Address *</Label>
                        <Textarea
                          {...register('guestAddress.fullAddress')}
                          placeholder="House #, Street, Sector, Landmark..."
                          rows={4}
                          className="resize-none"
                        />
                        {errors.guestAddress?.fullAddress && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.guestAddress.fullAddress.message}
                          </p>
                        )}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="guest-label">Label</Label>
                          <Input {...register('guestAddress.label')} placeholder="Home" />
                        </div>
                        <div>
                          <Label htmlFor="guest-floor">Floor / Apartment</Label>
                          <Input {...register('guestAddress.floor')} placeholder="2nd Floor, Flat B-3" />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="guest-instructions">Delivery Instructions</Label>
                        <Textarea
                          {...register('guestAddress.instructions')}
                          placeholder="Ring twice, leave at security..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <Controller
                  name="paymentMethod"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-3">
                      {[
                        { value: 'cash', label: 'Cash on Delivery', icon: Wallet, color: 'text-green-600' },
                        { value: 'card', label: 'Credit/Debit Card', icon: CreditCard, color: 'text-blue-600' },
                        { value: 'easypaisa', label: 'EasyPaisa', icon: Smartphone, color: 'text-green-600' },
                        { value: 'jazzcash', label: 'JazzCash', icon: Smartphone, color: 'text-red-600' },
                        { value: 'bank', label: 'Bank Transfer', icon: Building2, color: 'text-orange-600' },
                        { value: 'wallet', label: 'Wallet', icon: Wallet, color: 'text-purple-600' },
                      ].map((opt) => (
                        <Label
                          key={opt.value}
                          className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                        >
                          <RadioGroupItem value={opt.value} />
                          <opt.icon className={`h-6 w-6 ${opt.color}`} />
                          <span className="font-medium">{opt.label}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  )}
                />
              </CardContent>
            </Card>

            {/* Order Note */}
            <Card>
              <CardHeader>
                <CardTitle>Order Note (optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  {...register('instructions')}
                  placeholder="Extra spicy, no onions, etc... (max 300 chars)"
                  rows={3}
                />
                {errors.instructions && (
                  <p className="text-sm text-destructive mt-1">{errors.instructions.message}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-lg">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item._id} className="flex justify-between text-sm">
                      <span>{item.quantity} × {item.menuItem.name}</span>
                      <span>Rs. {(item.priceAtAdd * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>Rs. {deliveryFee.toLocaleString()}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">Rs. {total.toLocaleString()}</span>
                </div>

                {!isMinOrderMet && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Minimum order amount: Rs. {minOrderAmount.toLocaleString()}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting || !canProceed || createOrder.isPending || createGuestOrder.isPending}
                >
                  {createOrder.isPending || createGuestOrder.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    `Place Order — Rs. ${total.toLocaleString()}`
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}