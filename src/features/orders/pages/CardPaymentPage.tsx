// src/features/orders/pages/CardPaymentPage.tsx
import { useState, useEffect } from 'react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  PaymentElementProps,
} from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '@/features/cart/store/useCartStore';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentPageState {
  clientSecret: string;
  orderId: string;
  amount: number;
}

interface CardFormProps {
  orderId: string;
  amount: number;
}

function CardForm({ orderId, amount }: CardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { clearCart } = useCartStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders/success/${orderId}`,
        },
        redirect: 'if_required',
      });

      if (result.error) {
        setErrorMessage(result.error.message || 'Payment failed');
        toast.error(result.error.message || 'Payment failed');
      } else if (
        result.paymentIntent?.status === 'succeeded' ||
        result.paymentIntent?.status === 'processing'
      ) {
        clearCart();
        navigate(`/orders/success/${orderId}`, { replace: true });
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Payment failed');
      toast.error(err?.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentElementOptions: PaymentElementProps['options'] = {
    layout: 'tabs',
    defaultValues: { billingDetails: { address: { country: 'PK' } } },
    wallets: { applePay: 'auto', googlePay: 'auto' },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={paymentElementOptions} />

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full h-12 text-lg font-semibold"
        disabled={!stripe || !elements || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-5 w-5" />
            Pay Now • Secure via Stripe
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
        <Lock className="h-3 w-3" />
        Your card details are encrypted and never stored
      </p>
    </form>
  );
}

export default function CardPaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as PaymentPageState | null;

  const clientSecret = state?.clientSecret;
  const orderId = state?.orderId;
  const amount = state?.amount || 0;

  // Handle invalid session gracefully
  if (!clientSecret || !orderId) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <AlertCircle className="h-16 w-16 text-destructive/50 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Invalid Payment Session</h2>
          <p className="text-muted-foreground mb-6">
            Payment details are missing or expired. Please try checkout again.
          </p>
          <Button onClick={() => navigate('/cart')}>Back to Cart</Button>
        </Card>
      </div>
    );
  }

  const elementsOptions: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'flat',
      variables: {
        colorPrimary: '#e11d48',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        borderRadius: '12px',
        fontFamily: 'Inter, system-ui, sans-serif',
      },
    },
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
            <CreditCard className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Complete Payment</h1>
          <p className="text-muted-foreground">Secure card payment via Stripe</p>
        </div>

        {/* Payment Summary */}
        <Card className="mb-6 border-2 border-primary/20">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Amount to Pay</p>
            <p className="text-4xl font-bold text-primary">
              Rs. {amount.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Order #{orderId.slice(-6).toUpperCase()}
            </p>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Card Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={elementsOptions}>
              <CardForm orderId={orderId} amount={amount} />
            </Elements>
          </CardContent>
        </Card>

        {/* Stripe Badge */}
        <div className="mt-6 text-center">
          <img
            src="https://js.stripe.com/assets/badges/powered_by_stripe.svg"
            alt="Powered by Stripe"
            className="h-10 mx-auto opacity-70"
          />
        </div>
      </div>
    </div>
  );
}
