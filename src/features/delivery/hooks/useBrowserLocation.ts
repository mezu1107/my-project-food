import { useState, useCallback } from 'react';
import { useDeliveryStore } from '../store/deliveryStore';
import { toast } from 'sonner';

interface UseBrowserLocationReturn {
  detecting: boolean;
  error: string | null;
  detectLocation: () => Promise<{ lat: number; lng: number } | null>;
}

// Pakistan bounds
const PAKISTAN_BOUNDS = {
  minLat: 23.5,
  maxLat: 37.5,
  minLng: 60.0,
  maxLng: 78.0,
};

function isInPakistan(lat: number, lng: number): boolean {
  return (
    lat >= PAKISTAN_BOUNDS.minLat &&
    lat <= PAKISTAN_BOUNDS.maxLat &&
    lng >= PAKISTAN_BOUNDS.minLng &&
    lng <= PAKISTAN_BOUNDS.maxLng
  );
}

export function useBrowserLocation(): UseBrowserLocationReturn {
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUserLocation, setLocationPermission } = useDeliveryStore();

  const detectLocation = useCallback(async (): Promise<{ lat: number; lng: number } | null> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      toast.error('Geolocation not supported');
      return null;
    }

    setDetecting(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          
          setLocationPermission('granted');
          
          if (!isInPakistan(lat, lng)) {
            setError('We currently only deliver within Pakistan');
            toast.error('We currently only deliver within Pakistan');
            setDetecting(false);
            resolve(null);
            return;
          }

          setUserLocation(lat, lng);
          setDetecting(false);
          resolve({ lat, lng });
        },
        (err) => {
          setDetecting(false);
          
          switch (err.code) {
            case err.PERMISSION_DENIED:
              setLocationPermission('denied');
              setError('Location permission denied');
              toast.error('Please enable location access to use this feature');
              break;
            case err.POSITION_UNAVAILABLE:
              setError('Location information unavailable');
              toast.error('Unable to detect your location');
              break;
            case err.TIMEOUT:
              setError('Location request timed out');
              toast.error('Location detection timed out');
              break;
            default:
              setError('An unknown error occurred');
              toast.error('Failed to detect location');
          }
          
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }, [setUserLocation, setLocationPermission]);

  return { detecting, error, detectLocation };
}
