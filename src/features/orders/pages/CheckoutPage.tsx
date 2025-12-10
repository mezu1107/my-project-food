// src/features/orders/pages/CheckoutPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertCircle, MapPin, User, Phone, CreditCard, Wallet, Building2, Truck, Smartphone } from 'lucide-react';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useCartStore } from '@/features/cart/store/useCartStore';
import { useAddresses } from '@/features/address/hooks/useAddresses';
import { useAreas } from '@/hooks/useCheckArea';
import { useCreateOrder, useCreateGuestOrder } from '@/features/orders/hooks/useOrders';
import type { CreateOrderPayload, CreateGuestOrderPayload } from '@/types/order.types';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const checkoutSchema = z.object({
  paymentMethod: z.enum(['cod', 'card', 'easypaisa', 'jazzcash', 'bank']),
  addressId: z.string().optional(),
  guestAddress: z
    .object({
      fullAddress: z.string().min(10, 'Enter complete address'),
      areaId: z.string({ required_error: 'Select delivery area' }),
      label: z.string().optional(),
      floor: z.string().optional(),
      instructions: z.string().max(150).optional(),
    })
    .optional(),
  name: z.string().min(2, 'Name required').optional(),
  phone: z.string().regex(/^03\d{9}$/, 'Valid phone: 03XXXXXXXXX').optional(),
  promoCode: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const { items, subtotal, clearCart } = useCartStore();
  const { data: addresses } = useAddresses();
  const { data: areas } = useAreas();
  const createOrder = useCreateOrder();
  const createGuestOrder = useCreateGuestOrder();

  const [deliveryFee, setDeliveryFee] = useState(149);
  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [promoDiscount, setPromoDiscount] = useState(0);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: 'cod' },
  });

  const paymentMethod = watch('paymentMethod');
  const addressId = watch('addressId');
  const guestAreaId = watch('guestAddress.areaId');

  useEffect(() => {
    if (isAuthenticated && addresses?.length && !addressId) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      setValue('addressId', defaultAddr._id);
    }
  }, [addresses, isAuthenticated, addressId, setValue]);

  useEffect(() => {
    if (guestAreaId && areas) {
      const area = areas.find(a => a._id === guestAreaId);
      if (area?.deliveryZone) {
        setDeliveryFee(area.deliveryZone.deliveryFee);
        setMinOrderAmount(area.deliveryZone.minOrderAmount);
      }
    }
  }, [guestAreaId, areas]);

  const total = subtotal + deliveryFee - promoDiscount;
  const isMinOrderMet = subtotal >= minOrderAmount;

  const onSubmit = async (data: CheckoutForm) => {
    if (!isMinOrderMet) {
      toast({
        title: 'Minimum Order Not Met',
        description: `This area requires minimum Rs. ${minOrderAmount}`,
        variant: 'destructive',
      });
      return;
    }

    const baseItems = items.map(i => ({
      menuItem: i.menuItem._id,
      quantity: i.quantity,
    }));

    try {
      let response;

      if (isAuthenticated) {
        response = await createOrder.mutateAsync({
          items: baseItems,
          addressId: data.addressId!,
          paymentMethod: data.paymentMethod,
          promoCode: data.promoCode?.trim() || undefined,
        });
      } else {
        if (!data.guestAddress || !data.name || !data.phone) return;

        response = await createGuestOrder.mutateAsync({
          items: baseItems,
          guestAddress: {
            fullAddress: data.guestAddress.fullAddress,
            areaId: data.guestAddress.areaId,
            label: data.guestAddress.label || 'Home',
            floor: data.guestAddress.floor,
            instructions: data.guestAddress.instructions,
          },
          name: data.name.trim(),
          phone: data.phone,
          paymentMethod: data.paymentMethod,
          promoCode: data.promoCode?.trim() || undefined,
        });
      }

      clearCart();

      if (response.clientSecret) {
        navigate('/checkout/card', {
          state: { clientSecret: response.clientSecret, orderId: response.order._id, amount: response.order.finalAmount },
        });
      } else if (response.bankDetails) {
        navigate(`/checkout/bank-transfer/${response.order._id}`, {
          state: { order: response.order, bankDetails: response.bankDetails },
        });
      } else {
        navigate(`/order/${response.order._id}`);
        toast({ title: 'Order Placed!', description: 'We’re preparing your food!' });
      }
    } catch (err: any) {
      toast({
        title: 'Order Failed',
        description: err.response?.data?.message || 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
        <Button onClick={() => navigate('/menu')}>Browse Menu</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest / Auth Toggle */}
            {!isAuthenticated && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input {...register('name')} placeholder="Ahmad Khan" />
                    {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input {...register('phone')} placeholder="03451234567" />
                    {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isAuthenticated ? (
                  <Controller
                    control={control}
                    name="addressId"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose saved address" />
                        </SelectTrigger>
                        <SelectContent>
                          {addresses?.map(addr => (
                            <SelectItem key={addr._id} value={addr._id}>
                              <div>
                                <p className="font-medium">{addr.label}</p>
                                <p className="text-sm text-muted-foreground">{addr.fullAddress}</p>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : (
                  <>
                    <div>
                      <Label>Full Address</Label>
                      <Textarea {...register('guestAddress.fullAddress')} placeholder="House #123, Street 4, Gulberg III..." rows={3} />
                      {errors.guestAddress?.fullAddress && <p className="text-sm text-destructive">{errors.guestAddress.fullAddress.message}</p>}
                    </div>

                    <Controller
                      control={control}
                      name="guestAddress.areaId"
                      render={({ field }) => (
                        <div>
                          <Label>Delivery Area</Label>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your area" />
                            </SelectTrigger>
                            <SelectContent>
                              {areas?.map(area => (
                                <SelectItem key={area._id} value={area._id}>
                                  {area.name} {area.deliveryZone && `(Rs. ${area.deliveryZone.deliveryFee} delivery)`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.guestAddress?.areaId && <p className="text-sm text-destructive">Area required</p>}
                        </div>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input {...register('guestAddress.floor')} placeholder="Floor / Apartment (optional)" />
                      <Input {...register('guestAddress.label')} placeholder="Label (Home, Work)" defaultValue="Home" />
                    </div>
                    <Textarea {...register('guestAddress.instructions')} placeholder="Delivery instructions (optional)" rows={2} />
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment Method - NOW INCLUDES EASYPaisa & JazzCash */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <Controller
                  control={control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} value={field.value}>
                      <Label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="cod" />
                        <Wallet className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Cash on Delivery</p>
                          <p className="text-sm text-muted-foreground">Pay when you receive</p>
                        </div>
                      </Label>

                      <Label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="card" />
                        <CreditCard className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Credit / Debit Card</p>
                          <p className="text-sm text-muted-foreground">Pay securely online</p>
                        </div>
                      </Label>

                      {/* EasyPaisa */}
                      <Label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="easypaisa" />
                        <Smartphone className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">EasyPaisa</p>
                          <p className="text-sm text-muted-foreground">Pay via mobile wallet</p>
                        </div>
                      </Label>

                      {/* JazzCash */}
                      <Label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="jazzcash" />
                        <Smartphone className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium">JazzCash</p>
                          <p className="text-sm text-muted-foreground">Pay via mobile wallet</p>
                        </div>
                      </Label>

                      <Label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="bank" />
                        <Building2 className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Bank Transfer</p>
                          <p className="text-sm text-muted-foreground">Meezan Bank • Instant confirmation</p>
                        </div>
                      </Label>
                    </RadioGroup>
                  )}
                />
              </CardContent>
            </Card>

            {/* Promo Code */}
            <Card>
              <CardHeader>
                <CardTitle>Promo Code</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input {...register('promoCode')} placeholder="Enter code (e.g. WELCOME50)" className="uppercase" />
                  <Button type="button" variant="secondary">Apply</Button>
                </div>
                {promoDiscount > 0 && (
                  <Badge variant="secondary" className="mt-2">
                    Rs. {promoDiscount} off applied!
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map(item => (
                  <div key={item.menuItem._id} className="flex justify-between text-sm">
                    <span>{item.quantity} × {item.menuItem.name}</span>
                    <span>Rs. {item.menuItem.price * item.quantity}</span>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rs. {subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>Rs. {deliveryFee}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Discount</span>
                      <span>-Rs. {promoDiscount}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">Rs. {total}</span>
                </div>

                {!isMinOrderMet && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Minimum order: Rs. {minOrderAmount} (add Rs. {minOrderAmount - subtotal} more)
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting || !isMinOrderMet}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    `Pay Rs. ${total} & Place Order`
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By placing this order, you agree to our Terms of Service
                </p>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}