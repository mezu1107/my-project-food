// src/features/orders/components/StripePaymentForm.tsx
import { useState } from 'react';
import { loadStripe, PaymentIntent } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, ArrowLeft, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface StripePaymentFormProps {
  clientSecret: string;
  orderId: string;
  amount: number;
}

interface PaymentFormProps {
  orderId: string;
  amount: number;
}

function PaymentForm({ orderId, amount }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
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
          return_url: `${window.location.origin}/order/${orderId}`,
        },
        redirect: 'if_required',
      });

      const paymentIntent: PaymentIntent | null = result.paymentIntent || null;

      if (result.error) {
        setErrorMessage(result.error.message || 'Payment failed');
        toast.error(result.error.message || 'Payment failed');
      } else if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
        toast.success('Payment successful! Redirecting...');
        setTimeout(() => {
          navigate(`/track/${orderId}`);
        }, 1500);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Payment failed');
      toast.error(err?.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs',
          defaultValues: {
            billingDetails: { name: '', email: '', phone: '' },
          },
        }}
      />

      {errorMessage && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
          {errorMessage}
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
          disabled={isProcessing}
          className="flex-1"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Button type="submit" disabled={!stripe || isProcessing} className="flex-1">
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Pay Rs. {amount}
            </>
          )}
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" />
        <span>Secured by Stripe • 256-bit encryption</span>
      </div>
    </form>
  );
}

export default function StripePaymentForm({ clientSecret, orderId, amount }: StripePaymentFormProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/50 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Complete Your Payment</CardTitle>
          <p className="text-muted-foreground mt-2">
            Order ID: <span className="font-mono font-bold">#{orderId.slice(-6).toUpperCase()}</span>
          </p>
        </CardHeader>

        <CardContent>
          <div className="mb-8 p-6 bg-muted/50 rounded-xl text-center">
            <p className="text-sm text-muted-foreground">Amount Due</p>
            <p className="text-4xl font-bold text-primary">Rs. {amount}</p>
          </div>

          <Elements
            stripe={stripePromise}
            options={{
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
            }}
          >
            <PaymentForm orderId={orderId} amount={amount} />
          </Elements>
        </CardContent>
      </Card>
    </div>
  );
}
