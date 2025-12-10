import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2, Navigation, CheckCircle, XCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDeliveryCheck } from '../hooks/useDeliveryCheck';
import { useBrowserLocation } from '../hooks/useBrowserLocation';
import { useDeliveryStore } from '../store/deliveryStore';
import { forwardGeocode } from '../lib/reverseGeocode';
import { toast } from 'sonner';

interface DeliveryCheckerProps {
  onSuccess?: () => void;
  compact?: boolean;
}

export const DeliveryChecker = ({ onSuccess, compact = false }: DeliveryCheckerProps) => {
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { selectedArea, deliveryInfo, isInService, hasChecked } = useDeliveryStore();
  const { mutate: checkDelivery, isPending: isChecking } = useDeliveryCheck();
  const { detecting, detectLocation } = useBrowserLocation();

  const handleSearch = async (value: string) => {
    setAddress(value);
    
    if (value.length > 2) {
      const results = await forwardGeocode(value + ' Lahore Pakistan');
      setSuggestions(results.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: any) => {
    setAddress(suggestion.display_name.split(',').slice(0, 2).join(', '));
    setShowSuggestions(false);
    checkDelivery(
      { lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) },
      { onSuccess }
    );
  };

  const handleDetectLocation = async () => {
    const coords = await detectLocation();
    if (coords) {
      checkDelivery(coords, { onSuccess });
    }
  };

  const handleSubmit = async () => {
    if (!address.trim()) {
      toast.error('Please enter your address');
      return;
    }

    const results = await forwardGeocode(address + ' Lahore Pakistan');
    if (results.length > 0) {
      const first = results[0];
      checkDelivery(
        { lat: parseFloat(first.lat), lng: parseFloat(first.lon) },
        { onSuccess }
      );
    } else {
      toast.error('Address not found. Try a different search.');
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter area..."
            value={address}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-10"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isChecking || detecting}
        >
          {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background/95 backdrop-blur-lg rounded-3xl p-6 md:p-8 shadow-2xl border border-border/50">
      <h3 className="text-xl font-bold text-foreground mb-2">
        Check if we deliver to you
      </h3>
      <p className="text-muted-foreground mb-6">
        Enter your address to see delivery time & availability
      </p>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter your address (e.g., Gulberg, Lahore)"
            value={address}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-12 h-14 text-base rounded-xl"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-background rounded-xl shadow-xl border border-border z-50 overflow-hidden"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full px-4 py-3 flex items-start hover:bg-muted transition-colors text-left"
                  >
                    <MapPin className="w-4 h-4 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm line-clamp-2">
                      {suggestion.display_name}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={isChecking || detecting}
            className="flex-1 h-12 rounded-xl"
          >
            {isChecking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              'Check Delivery'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleDetectLocation}
            disabled={isChecking || detecting}
            className="h-12 px-4 rounded-xl"
            title="Use my location"
          >
            {detecting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Navigation className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Status Banner */}
        <AnimatePresence mode="wait">
          {hasChecked && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-xl p-4 ${
                isInService
                  ? 'bg-green-500/10 border border-green-500/20'
                  : 'bg-destructive/10 border border-destructive/20'
              }`}
            >
              <div className="flex items-start gap-3">
                {isInService ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive mt-0.5" />
                )}
                <div>
                  {isInService && selectedArea && deliveryInfo ? (
                    <>
                      <p className="font-semibold text-green-500">
                        Yes! We deliver to {selectedArea.name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Estimated delivery:{' '}
                        <span className="font-medium text-foreground">
                          {deliveryInfo.estimatedTime}
                        </span>
                        {deliveryInfo.fee > 0 && (
                          <> • Delivery fee: Rs. {deliveryInfo.fee}</>
                        )}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-destructive">
                        Coming soon to your area
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        We're expanding! Join waitlist to get notified.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Coverage areas hint */}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Currently serving:{' '}
          <span className="text-foreground">
            Gulberg, DHA, Johar Town, Model Town, Garden Town, Bahria Town
          </span>
        </p>
      </div>
    </div>
  );
};
