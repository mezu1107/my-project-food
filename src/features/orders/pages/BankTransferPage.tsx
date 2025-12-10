
// src/features/orders/pages/BankTransferPage.tsx
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, Copy, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface BankDetails {
  amount: number;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  branch: string;
  reference: string;
}

interface OrderInfo {
  _id: string;
  finalAmount: number;
  status: string;
}

export default function BankTransferPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);

  // Safely extract state from location
  const state = location.state as { order: OrderInfo; bankDetails: BankDetails } | null;
  
  if (!state?.order || !state?.bankDetails) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <AlertCircle className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Payment Details Missing</h2>
          <p className="text-muted-foreground mb-6">
            It looks like you reached this page directly. Please complete checkout first.
          </p>
          <Button onClick={() => navigate('/cart')}>Back to Cart</Button>
        </Card>
      </div>
    );
  }

  const { order, bankDetails } = state;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyButton = ({ text, label }: { text: string; label: string }) => (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => copyToClipboard(text, label)}
    >
      {copied === label ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );

  return (
    <div className="min-h-screen bg-muted/30 pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-orange-500/10 to-background pt-8 pb-12 text-center">
        <div className="w-20 h-20 rounded-full bg-orange-500/10 mx-auto mb-4 flex items-center justify-center">
          <Building2 className="h-10 w-10 text-orange-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Complete Bank Transfer</h1>
        <p className="text-muted-foreground">Transfer the exact amount to confirm your order</p>
        <Badge className="mt-3 bg-orange-500">
          <Clock className="h-3 w-3 mr-1" />
          Expires in 15 minutes
        </Badge>
      </div>

      <div className="container mx-auto px-4 -mt-6 max-w-lg space-y-6">
        {/* Amount Card */}
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Amount to Pay</p>
            <p className="text-4xl font-bold text-primary">
              Rs. {bankDetails.amount.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Order #{order._id.slice(-6).toUpperCase()}
            </p>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Bank Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Bank Name', value: bankDetails.bankName },
              { label: 'Account Title', value: bankDetails.accountTitle },
              { label: 'Account Number', value: bankDetails.accountNumber },
              { label: 'IBAN', value: bankDetails.iban },
              { label: 'Branch', value: bankDetails.branch },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="font-medium font-mono text-base">{item.value}</p>
                </div>
                <CopyButton text={item.value} label={item.label} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Reference Code - Highlighted */}
        <Card className="border-2 border-orange-500/30 bg-orange-500/5">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Reference Code (Required)</p>
            <div className="flex items-center justify-center gap-4">
              <p className="text-3xl font-bold font-mono text-orange-600 tracking-widest">
                {bankDetails.reference}
              </p>
              <CopyButton text={bankDetails.reference} label="Reference Code" />
            </div>
            <p className="text-xs text-orange-600 mt-4 flex items-center justify-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Must include in transfer remarks/description
            </p>
          </CardContent>
        </Card>

        {/* How to Pay */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">How to Pay</h3>
            <ol className="space-y-3 text-sm">
              {[
                "Open your banking app, ATM, or visit branch",
                `Transfer exactly <strong>Rs. ${bankDetails.amount.toLocaleString()}</strong>`,
                `In remarks/notes, write: <strong>${bankDetails.reference}</strong>`,
                "Your order will be confirmed within 5–15 minutes",
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    {i + 1}
                  </span>
                  <span dangerouslySetInnerHTML={{ __html: step }} />
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Warning */}
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm text-center">
          <AlertCircle className="inline-block h-4 w-4 mr-1" />
          Order will be automatically cancelled if payment is not received within 15 minutes
        </div>

        {/* Action Button */}
        <Button
          size="lg"
          className="w-full h-14 text-lg font-semibold"
          onClick={() => navigate(`/orders/${orderId}`)}
        >
          I’ve Made the Transfer
          <ArrowRight className="ml-3 h-6 w-6" />
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          You’ll be notified as soon as we confirm your payment
        </p>
      </div>
    </div>
  );
}