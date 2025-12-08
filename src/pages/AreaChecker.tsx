// src/components/AreaChecker.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, X, Loader2, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { useStore } from '@/lib/store';

interface CheckAreaResponse {
  success: boolean;
  inService: boolean;
  area?: {
    _id: string;
    name: string;
    city: string;
  };
  delivery?: {
    fee: number;
    minOrder: number;
    estimatedTime: string;
  };
  message?: string;
}

interface AreaCheckerProps {
  onConfirmed?: (data: {
    id: string;
    name: string;
    city: string;
    fullAddress: string;
    deliveryFee: number;
    estimatedTime: string;
  }) => void;
  onNotInService?: () => void;
  onClose?: () => void;
  disableAutoNavigate?: boolean;
}

export default function AreaChecker({
  onConfirmed,
  onNotInService,
  onClose,
  disableAutoNavigate = false,
}: AreaCheckerProps) {
  const [loadingGoogle, setLoadingGoogle] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [checking, setChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const setSelectedArea = useStore((s) => s.setSelectedArea);

  // Load Google Places
  useEffect(() => {
    if ((window as any).google?.maps?.places) {
      setLoadingGoogle(false);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => setLoadingGoogle(false);
    script.onerror = () => {
      toast.error('Failed to load Google Maps');
      setLoadingGoogle(false);
    };

    document.head.appendChild(script);

    return () => {
      const existing = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existing) document.head.removeChild(existing);
    };
  }, []);

  // Setup autocomplete
  useEffect(() => {
    if (loadingGoogle || !inputRef.current) return;
    if (!(window as any).google?.maps?.places) return;

    const autocomplete = new (window as any).google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'pk' },
      fields: ['formatted_address', 'geometry.location'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location) {
        toast.error('Please select a valid address');
        return;
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const address = place.formatted_address || 'Selected Location';

      checkDelivery(lat, lng, address);
    });
  }, [loadingGoogle]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Location not supported');
      return;
    }

    setDetecting(true);
    toast.loading('Detecting location...', { id: 'geo' });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss('geo');
        checkDelivery(pos.coords.latitude, pos.coords.longitude, 'Your current location');
      },
      () => {
        toast.dismiss('geo');
        toast.error('Location access denied. Enter address manually.');
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const checkDelivery = async (lat: number, lng: number, displayAddress: string) => {
    setChecking(true);

    try {
      const res = await apiClient.get<CheckAreaResponse>('/areas/check', {
        params: { lat, lng },
      });

      if (res.success && res.inService && res.area && res.delivery) {
        const data = {
          id: res.area._id,
          name: res.area.name,
          city: res.area.city,
          fullAddress: displayAddress,
          deliveryFee: res.delivery.fee,
          estimatedTime: res.delivery.estimatedTime,
        };

        setSelectedArea(data);
        onConfirmed?.(data);

        toast.success(`Delivery available in ${res.area.name}!`);

        if (!disableAutoNavigate) {
          navigate('/menu', { replace: true });
        }
      } else {
        toast.info(res.message || "We don't deliver here yet");
        onNotInService?.();
      }
    } catch {
      toast.error('Failed to check delivery');
      onNotInService?.();
    } finally {
      setChecking(false);
      setDetecting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-2xl border-green-200">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold flex items-center gap-3">
            <MapPin className="h-8 w-8 text-green-600" />
            Where should we deliver?
          </h3>

          {onClose && (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        <Button
          onClick={detectLocation}
          disabled={detecting || checking}
          className="w-full h-14 text-lg font-medium"
        >
          {detecting || checking ? (
            <>
              <Loader2 className="mr-3 h-6 w-6 animate-spin" />
              Checking…
            </>
          ) : (
            <>
              <Navigation className="mr-3 h-6 w-6" />
              Use My Location
            </>
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">or</div>

        <div className="space-y-2">
          <input
            ref={inputRef}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
            type="text"
            placeholder="House no, street, area… e.g. G-10/2, Islamabad"
            disabled={loadingGoogle || checking}
          />

          {loadingGoogle && (
            <p className="text-center text-xs text-muted-foreground">
              <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
              Loading Google Places…
            </p>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Free delivery above Rs. 999
        </p>
      </div>
    </Card>
  );
}
