// src/features/orders/pages/OrderRefundRequestPage.tsx
// PRODUCTION-READY — DECEMBER 29, 2025
// Mobile-first, accessible, beautiful refund flow
// Full validation, eligibility checks, clear feedback
import { AnyOrderResponse } from '@/types/order.types'; // ← Add this import
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { ArrowLeft, Receipt, Shield, AlertCircle, CreditCard, Package } from 'lucide-react';

import { toast } from 'sonner';
import { format } from 'date-fns';

import { useOrder, useTrackOrder } from '@/features/orders/hooks/useOrders';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useRequestRefund } from '@/features/orders/hooks/useOrders';

import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/order.types';

/* ------------------------------------------------------------------ */
/* ZOD SCHEMA                                                         */
/* ------------------------------------------------------------------ */
const refundSchema = z.object({
  amount: z
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number',
    })
    .positive('Amount must be greater than 0')
    .max(999999, 'Amount is too large'),

  reason: z
    .string()
    .min(15, 'Please provide a detailed reason (at least 15 characters)')
    .max(500, 'Reason cannot exceed 500 characters'),
});

type RefundForm = z.infer<typeof refundSchema>;

export default function OrderRefundRequestPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

const privateQuery = useOrder(orderId);
const publicQuery = useTrackOrder(orderId);

const query = isAuthenticated ? privateQuery : publicQuery;
const { data: response, isLoading, isError } = query;
const order = (response as AnyOrderResponse)?.order;
 

  const requestRefundMutation = useRequestRefund();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<RefundForm>({
    resolver: zodResolver(refundSchema),
    defaultValues: {
      amount: 0,
      reason: '',
    },
  });

  const requestedAmount = watch('amount');

  /* ------------------------------------------------------------------ */
  /* Auto-fill maximum refundable amount                                 */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (order?.finalAmount) {
      setValue('amount', order.finalAmount);
    }
  }, [order?.finalAmount, setValue]);

  /* ------------------------------------------------------------------ */
  /* Format currency helper                                             */
  /* ------------------------------------------------------------------ */
  const formatPKR = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  /* ------------------------------------------------------------------ */
  /* Submit Refund Request                                              */
  /* ------------------------------------------------------------------ */
  const onSubmit = async (data: RefundForm) => {
    if (!order || !orderId) return;

    if (data.amount > order.finalAmount) {
      toast.error('Requested amount cannot exceed total paid');
      return;
    }

    requestRefundMutation.mutate(
      {
        orderId,
        amount: data.amount,
        reason: data.reason.trim(),
      },
      {
        onSuccess: () => {
          toast.success(
            'Refund request submitted successfully! We’ll review it within 24 hours.'
          );
          reset();
          navigate(`/track/${orderId}`);
        },
      }
    );
  };

  /* ------------------------------------------------------------------ */
  /* Loading State                                                      */
  /* ------------------------------------------------------------------ */
  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <div className="space-y-8">
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </main>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Error / Order Not Found                                            */
  /* ------------------------------------------------------------------ */
  if (isError || !order) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/20">
        <Card className="w-full max-w-md text-center p-8 md:p-10 shadow-xl">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Order Not Found</h2>
          <p className="text-base text-muted-foreground mb-8">
            The order you're looking for doesn't exist or has been removed.
          </p>
          <Button size="lg" asChild>
            <Link to="/orders">Go to My Orders</Link>
          </Button>
        </Card>
      </main>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Eligibility Check                                                  */
  /* ------------------------------------------------------------------ */
  const isEligible =
    order.status === 'delivered' &&
    order.paymentMethod === 'card' &&
    order.paymentStatus === 'paid';

  if (!isEligible) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/20">
        <Card className="w-full max-w-lg p-8 md:p-10 text-center shadow-xl">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Refund Not Available</h2>
          <div className="text-left text-base text-muted-foreground space-y-3 mb-8">
            <p>Refunds are only available if:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Order is marked as <strong>Delivered</strong></li>
              <li>Paid via <strong>Credit/Debit Card</strong></li>
              <li>Payment status is <strong>Paid</strong></li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Current status: <Badge className={ORDER_STATUS_COLORS[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
            </p>
            <p className="text-sm text-muted-foreground">
              Payment method: <strong>{order.paymentMethod.toUpperCase()}</strong>
            </p>
          </div>
          <Button size="lg" asChild className="mt-8">
            <Link to={`/track/${order._id}`}>Back to Order</Link>
          </Button>
        </Card>
      </main>
    );
  }

  const shortId = order.shortId || `#${order._id.slice(-6).toUpperCase()}`;

  /* ------------------------------------------------------------------ */
  /* Main Refund Request Form                                           */
  /* ------------------------------------------------------------------ */
  return (
    <main className="min-h-screen bg-gradient-to-b from-muted/20 to-background py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-8 text-base">
          <Link to={`/track/${order._id}`}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Order
          </Link>
        </Button>

        {/* Header */}
        <header className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 mb-6 shadow-lg">
            <Receipt className="h-10 w-10 text-amber-600" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
            Request a Refund
          </h1>
          <p className="text-lg text-muted-foreground">
            Order <span className="font-bold text-primary">{shortId}</span> •{' '}
            {format(new Date(order.placedAt), 'dd MMM yyyy')}
          </p>
          <Badge className="mt-4 text-base px-5 py-2 bg-green-500 text-white">
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
        </header>

        {/* Order Summary Card */}
        <Card className="mb-10 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
              <Package className="h-6 w-6" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex justify-between text-base md:text-lg">
              <span>Total Paid</span>
              <span className="font-bold">{formatPKR(order.finalAmount)}</span>
            </div>
            <div className="flex justify-between text-base md:text-lg">
              <span>Payment Method</span>
              <span className="font-medium flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Card
              </span>
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground text-center pt-2">
              You can request up to <strong>{formatPKR(order.finalAmount)}</strong> as refund
            </p>
          </CardContent>
        </Card>

        {/* Refund Form */}
        <Card className="shadow-2xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl md:text-2xl">Refund Request Form</CardTitle>
            <CardDescription className="text-base">
              Please fill in the details below. We typically process requests within 24 hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Amount */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label htmlFor="amount" className="text-base md:text-lg font-medium">
                    Refund Amount
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    Max: <strong>{formatPKR(order.finalAmount)}</strong>
                  </span>
                </div>
                <Input
                  id="amount"
                  type="number"
                  min={1}
                  max={order.finalAmount}
                  step={1}
                  placeholder="Enter amount in PKR"
                  className="h-14 text-lg"
                  {...register('amount', { valueAsNumber: true })}
                />
                {errors.amount && (
                  <p className="mt-2 text-sm text-destructive">{errors.amount.message}</p>
                )}
              </div>

              {/* Reason */}
              <div>
                <Label htmlFor="reason" className="text-base md:text-lg font-medium mb-3 block">
                  Reason for Refund <span className="text-muted-foreground font-normal">(required)</span>
                </Label>
                <Textarea
                  id="reason"
                  rows={7}
                  placeholder="Please explain in detail why you are requesting a refund. This helps us process your request faster and improve our service.

Examples:
• Food was cold upon arrival
• Wrong item delivered
• Missing items in order
• Poor food quality"
                  className="resize-none text-base"
                  {...register('reason')}
                />
                <div className="mt-2 flex justify-between text-sm">
                  <p className={errors.reason ? 'text-destructive' : 'text-muted-foreground'}>
                    {errors.reason?.message || 'Detailed reason helps us serve you better'}
                  </p>
                  <p className="text-muted-foreground">{watch('reason')?.length || 0}/500</p>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg font-semibold shadow-lg bg-amber-600 hover:bg-amber-700"
                disabled={
                  requestRefundMutation.isPending ||
                  requestedAmount <= 0 ||
                  requestedAmount > order.finalAmount
                }
              >
                {requestRefundMutation.isPending ? (
                  <>Submitting Request...</>
                ) : (
                  <>Submit Refund Request</>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground pt-4">
                Refunds are processed back to your original card within 3–7 business days.
                You’ll receive email updates on your request status.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}