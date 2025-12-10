// src/components/AreaChecker.tsx
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Navigation, X, Search } from "lucide-react";
import { toast } from "sonner";
import { useCheckArea } from "@/hooks/useCheckArea";
import { useDeliveryStore } from "@/features/delivery/store/deliveryStore";
import { useNavigate } from "react-router-dom";

interface AreaCheckerProps {
  onConfirmed?: (data: any) => void;
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
  const [detecting, setDetecting] = useState(false);
  const [manualLatLng, setManualLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const navigate = useNavigate();

  // Zustand store with correct setDeliveryInfo
  const { setDeliveryInfo } = useDeliveryStore();

  // Use React Query hook
  const { data, isLoading, error } = useCheckArea(
    manualLatLng?.lat,
    manualLatLng?.lng
  );

  // Auto-detect location on mount
  useEffect(() => {
    if ("geolocation" in navigator && !manualLatLng) {
      setDetecting(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setManualLatLng({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setDetecting(false);
        },
        () => {
          toast.error("Location access denied");
          setDetecting(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [manualLatLng]);

  // Handle successful delivery check
  useEffect(() => {
    if (!data || isLoading || error) return;

    if (data.inService && data.area) {
      const payload = {
        areaId: data.area._id,
        areaName: data.area.name,
        city: data.area.city,
        deliveryFee: data.delivery?.fee ?? 149,
        minOrderAmount: data.delivery?.minOrder ?? 0,
        estimatedTime: data.delivery?.estimatedTime ?? "35-50 min",
        center: data.area.center,
      };

      setDeliveryInfo(payload); // Now works!
      sessionStorage.setItem("selectedArea", JSON.stringify(payload));

      toast.success(
        data.hasDeliveryZone
          ? `Delivering to ${data.area.name}! Fee: Rs.${payload.deliveryFee}`
          : `We’re in ${data.area.name}! Delivery coming soon`
      );

      onConfirmed?.(payload);

      if (!disableAutoNavigate) {
        navigate("/menu", { replace: true });
      }
    } else {
      toast.info(data.message || "We don’t deliver here yet");
      onNotInService?.();
    }
  }, [data, isLoading, error, navigate, onConfirmed, onNotInService, disableAutoNavigate]);

  // Google Places Autocomplete
  useEffect(() => {
    if (!inputRef.current || !window.google?.maps?.places) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["geocode"],
      componentRestrictions: { country: "pk" },
      fields: ["geometry.location", "formatted_address"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        setManualLatLng({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    });

    autocompleteRef.current = autocomplete;
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-0 rounded-3xl overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <MapPin className="h-8 w-8" />
            Delivery Location
          </h3>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        <p className="text-green-50">Enter your address to see if we deliver there</p>
      </div>

      <div className="p-6 space-y-6 bg-white">
        <Button
          onClick={() =>
            navigator.geolocation.getCurrentPosition(
              (pos) => setManualLatLng({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
              () => toast.error("Location access denied")
            )
          }
          disabled={detecting || isLoading}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
        >
          {detecting || isLoading ? (
            <>
              <Loader2 className="mr-3 h-6 w-6 animate-spin" />
              Detecting Location...
            </>
          ) : (
            <>
              <Navigation className="mr-3 h-6 w-6" />
              Use My Current Location
            </>
          )}
        </Button>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search your address in Pakistan..."
            className="pl-12 py-7 text-lg rounded-xl border-2 focus:border-primary"
          />
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Currently delivering to select areas in <strong>Lahore</strong>
          </p>
          <p className="text-xs text-muted-foreground/80">
            More cities coming soon!
          </p>
        </div>
      </div>
    </Card>
  );
}