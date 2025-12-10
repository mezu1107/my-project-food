import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Loader2, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface NotifyWhenAvailableFormProps {
  areaName?: string;
}

export const NotifyWhenAvailableForm = ({ areaName }: NotifyWhenAvailableFormProps) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email && !phone) {
      toast.error('Please enter email or phone number');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success("You're on the list!", {
      description: "We'll notify you when we start delivering to your area",
    });
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-6"
      >
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">You're on the waitlist!</h3>
        <p className="text-muted-foreground text-sm">
          We'll notify you as soon as we start delivering to your area.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="bg-muted/50 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Get notified when we're there</h3>
          <p className="text-sm text-muted-foreground">
            {areaName ? `We're not in ${areaName} yet, but` : "We're"} expanding fast!
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11"
        />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex-1 border-t border-border" />
          <span>or</span>
          <span className="flex-1 border-t border-border" />
        </div>
        <Input
          type="tel"
          placeholder="Phone number (03XX-XXXXXXX)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-11"
        />
        <Button
          type="submit"
          className="w-full h-11"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Bell className="w-4 h-4 mr-2" />
              Notify Me
            </>
          )}
        </Button>
      </form>
    </div>
  );
};
