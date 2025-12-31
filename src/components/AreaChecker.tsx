// src/components/AreaChecker.tsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, MapPin, Navigation, X, Search, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { useCheckArea } from '@/hooks/useCheckArea';
import { useDeliveryStore } from '@/lib/deliveryStore';

/* ---------------------------------------------------------
   Google Maps config
---------------------------------------------------------- */
const GOOGLE_API_KEY: string | undefined = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
const isGooglePlacesEnabled: boolean =
  typeof GOOGLE_API_KEY === 'string' && GOOGLE_API_KEY.trim().length > 0;

/* ---------------------------------------------------------
   Types
---------------------------------------------------------- */
interface Coordinates {
  lat: number;
  lng: number;
}

export interface ConfirmedPayload {
  area: {
    _id: string;
    name: string;
    city: string;
    center: Coordinates;
  };
  delivery: {
    deliveryFee: number;
    minOrderAmount: number;
    estimatedTime: string;
    freeDeliveryAbove?: number;
  } | null;
}

interface AreaCheckerProps {
  onConfirmed?: (data: ConfirmedPayload) => void;
  onNotInService?: () => void;
  onClose?: () => void;
  disableAutoNavigate?: boolean;
}

/* ---------------------------------------------------------
   Component
---------------------------------------------------------- */
export default function AreaChecker({
  onConfirmed,
  onNotInService,
  onClose,
  disableAutoNavigate = false,
}: AreaCheckerProps) {
  const navigate = useNavigate();
  const { setDeliveryArea, setError } = useDeliveryStore();

  const [detecting, setDetecting] = useState(false);
  const [searchCoords, setSearchCoords] = useState<Coordinates | null>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [googleError, setGoogleError] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  /* ---------------------------------------------------------
     API Hook
  ---------------------------------------------------------- */
  const { data, isLoading, error } = useCheckArea(
    searchCoords?.lat,
    searchCoords?.lng
  );

  /* ---------------------------------------------------------
     Load Google Places Script
  ---------------------------------------------------------- */
  useEffect(() => {
    if (!isGooglePlacesEnabled) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => setGoogleLoaded(true);
    script.onerror = () => {
      setGoogleError(true);
      toast.error('Google Maps failed to load');
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  /* ---------------------------------------------------------
     Init Autocomplete
  ---------------------------------------------------------- */
  useEffect(() => {
    if (!googleLoaded || !inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode'],
      componentRestrictions: { country: 'pk' },
      fields: ['formatted_address', 'geometry'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const location = place.geometry?.location;

      if (!location) {
        toast.error('No location found');
        return;
      }

      setSearchCoords({ lat: location.lat(), lng: location.lng() });
      toast.success(place.formatted_address ?? 'Searching area...');
    });

    autocompleteRef.current = autocomplete;
    return () => {
      if (autocompleteRef.current) window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
    };
  }, [googleLoaded]);

  /* ---------------------------------------------------------
     Auto Detect Location
  ---------------------------------------------------------- */
  useEffect(() => {
    if (!('geolocation' in navigator) || searchCoords) return;

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSearchCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setDetecting(false);
      },
      () => {
        setDetecting(false);
        toast.error('Location access denied');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, [searchCoords]);

  /* ---------------------------------------------------------
     Handle API Result
  ---------------------------------------------------------- */
  useEffect(() => {
    if (isLoading || !data) return;

    if (error) {
      toast.error('Failed to check location');
      setError('Network or server error');
      return;
    }

    if (!data.inService) {
      toast.info(data.message ?? 'We do not deliver here yet');
      setError(data.message ?? 'Not in service area');
      onNotInService?.();
      return;
    }

    if (!data.deliverable) {
      toast.warning(data.message ?? 'Too far for delivery');
      setError(data.message ?? 'Outside delivery range');
      onNotInService?.();
      return;
    }

    const feeStructure = data.reason.includes('Distance-based') ? 'distance' as const : 'flat' as const;

    const area = {
      _id: 'temp-id',
      name: data.area,
      city: data.city,
      center: { lat: 0, lng: 0 },
    };

    const delivery = {
      deliveryFee: data.deliveryFee,
      minOrderAmount: data.minOrderAmount,
      estimatedTime: data.estimatedTime,
      feeStructure,
      freeDeliveryAbove: (data as any).freeDeliveryAbove ?? undefined,
    };

    setDeliveryArea(area, delivery);

    // Enhanced toast including freeDeliveryAbove
    let toastMessage = `Delivery available in ${area.name}! Rs.${delivery.deliveryFee} • ${data.reason}`;
    if (delivery.freeDeliveryAbove) {
      toastMessage += ` — Free delivery above Rs.${delivery.freeDeliveryAbove}`;
    }
    toast.success(toastMessage);

    onConfirmed?.({ area, delivery });

    if (!disableAutoNavigate) navigate('/menu', { replace: true });
  }, [data, isLoading, error, navigate, onConfirmed, onNotInService, disableAutoNavigate, setDeliveryArea, setError]);

  /* ---------------------------------------------------------
     Manual Location Button
  ---------------------------------------------------------- */
  const handleManualLocation = () => {
    if (!('geolocation' in navigator)) {
      toast.error('Geolocation not supported');
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSearchCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setDetecting(false);
      },
      () => {
        toast.error('Permission denied');
        setDetecting(false);
      }
    );
  };

  /* ---------------------------------------------------------
     UI
  ---------------------------------------------------------- */
  return (
    <Card className="mx-auto w-full max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg overflow-hidden rounded-3xl border-0 shadow-xl">
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-6 sm:px-6 md:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3 font-black text-white [font-size:clamp(1.4rem,3vw,2.2rem)]">
              <MapPin className="h-7 w-7 sm:h-9 sm:w-9" />
              Check Delivery Area
            </h1>
            <p className="mt-2 text-green-100 [font-size:clamp(0.95rem,2.5vw,1.1rem)]">
              Enter your address to see availability
            </p>
          </div>

          {onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              aria-label="Close"
              className="rounded-full text-white hover:bg-white/20"
            >
              <X />
            </Button>
          )}
        </div>
      </header>

      <main className="space-y-6 bg-gray-50 px-4 py-6 sm:px-6 md:px-8">
        <Button
          onClick={handleManualLocation}
          disabled={detecting || isLoading}
          className="flex min-h-[3.5rem] w-full items-center justify-center gap-3 text-base font-semibold sm:text-lg"
        >
          {detecting || isLoading ? (
            <>
              <Loader2 className="animate-spin" />
              Detecting…
            </>
          ) : (
            <>
              <Navigation />
              Use Current Location
            </>
          )}
        </Button>

        <div className="relative text-center">
          <span className="relative z-10 bg-gray-50 px-4 text-sm text-gray-500">OR</span>
          <div className="absolute inset-0 top-1/2 border-t" />
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            ref={inputRef}
            disabled={!isGooglePlacesEnabled || googleError}
            placeholder="Search address in Pakistan"
            className="min-h-[3.5rem] pl-12 text-base"
          />
          {googleError && (
            <p className="mt-2 flex items-center gap-2 text-sm text-orange-600">
              <AlertCircle className="h-4 w-4" />
              Google Maps unavailable
            </p>
          )}
        </div>

        {data && (
          <div className="rounded-lg bg-white p-5 shadow-sm border">
            {data.inService && data.deliverable ? (
              <div className="space-y-2 text-green-700">
                <p className="font-bold text-lg">✅ Delivery Available in {data.area}</p>
                <p>• Fee: <strong>Rs.{data.deliveryFee}</strong></p>
                <p>• {data.reason}</p>
                <p>• Min Order: Rs.{data.minOrderAmount}</p>
                <p>• Estimated: {data.estimatedTime}</p>
                {(data as any).freeDeliveryAbove && (
                  <p>• Free delivery above Rs.{(data as any).freeDeliveryAbove}</p>
                )}
              </div>
            ) : (
              <p className="text-orange-600 font-medium">
                {data.message || 'Delivery not available at this location'}
              </p>
            )}
          </div>
        )}

        {isLoading && (
          <div className="py-6 text-center">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-green-600" />
            <p className="text-gray-600">Checking your location...</p>
          </div>
        )}

        <footer className="text-center text-sm text-gray-500 pt-4">
          Delivering in <strong>Islamabad</strong> & <strong>Rawalpindi</strong>
        </footer>
      </main>
    </Card>
  );
}
