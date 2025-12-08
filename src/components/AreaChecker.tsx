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
  hasDeliveryZone: boolean;
  area?: { _id: string; name: string; city: string; center: { lat: number; lng: number } };
  delivery?: { fee: number; minOrder: number; estimatedTime: string };
  message?: string;
}

export default function AreaChecker({
  onConfirmed,
  onNotInService,
  onClose,
  disableAutoNavigate = false,
}: {
  onConfirmed?: (data: any) => void;
  onNotInService?: () => void;
  onClose?: () => void;
  disableAutoNavigate?: boolean;
}) {
  const [loadingGoogle, setLoadingGoogle] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [checking, setChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const setSelectedArea = useStore(s => s.setSelectedArea);

  // Load Google Places
  useEffect(() => {
    if ((window as any).google?.maps?.places) {
      setLoadingGoogle(false);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => setLoadingGoogle(false);
    document.head.appendChild(script);

    return () => {
      const s = document.querySelector(`script[src*="maps.googleapis.com"]`);
      s?.remove();
    };
  }, []);

  // Autocomplete
  useEffect(() => {
    if (loadingGoogle || !inputRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'pk' },
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location) return toast.error('Invalid address');

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      checkDelivery(lat, lng, place.formatted_address || 'Selected location');
    });
  }, [loadingGoogle]);

  const detectLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');

    setDetecting(true);
    toast.loading('Detecting location...');

    navigator.geolocation.getCurrentPosition(
      pos => {
        toast.dismiss();
        checkDelivery(pos.coords.latitude, pos.coords.longitude, 'Your current location');
      },
      () => {
        toast.dismiss();
        toast.error('Location access denied');
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const checkDelivery = async (lat: number, lng: number, address: string) => {
    setChecking(true);
    try {
const { data } = await apiClient.get<{ data: CheckAreaResponse }>('/areas/check', {
        params: { lat, lng },
      });

      if (data.inService && data.area) {
        const payload = {
          id: data.area._id,
          name: data.area.name,
          city: data.area.city,
          fullAddress: address,
          deliveryFee: data.delivery?.fee || 149,
          estimatedTime: data.delivery?.estimatedTime || '35-50 min',
        };

        setSelectedArea(payload);
        onConfirmed?.(payload);
        toast.success(`Delivery available in ${data.area.name}!`);

        if (!disableAutoNavigate) navigate('/menu', { replace: true });
      } else {
        toast.info(data.message || "We don't deliver here yet");
        onNotInService?.();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to check location');
      onNotInService?.();
    } finally {
      setChecking(false);
      setDetecting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-2xl">
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold flex items-center gap-3">
          <MapPin className="w-8 h-8 text-green-600" />
          Delivery Address
        </h3>
        {onClose && <button onClick={onClose}><X className="w-6 h-6" /></button>}
      </div>

      <Button
        onClick={detectLocation}
        disabled={detecting || checking}
        className="w-full h-14 text-lg"
      >
        {detecting || checking ? (
          <> <Loader2 className="mr-3 h-6 w-6 animate-spin" /> Checking... </>
        ) : (
          <> <Navigation className="mr-3 h-6 w-6" /> Use My Location </>
        )}
      </Button>

      <div className="text-center text-sm text-gray-500">or</div>

      <input
        ref={inputRef}
        type="text"
        placeholder="Enter your address..."
        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        disabled={loadingGoogle}
      />

      {loadingGoogle && <p className="text-center text-sm text-gray-500"><Loader2 className="inline mr-2 h-4 w-4 animate-spin" /> Loading map...</p>}
    </div>
  </Card>
  );
}