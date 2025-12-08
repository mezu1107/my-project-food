import { MapPin, Clock, Truck, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeliveryStore } from '@/features/delivery/store/deliveryStore';

interface MenuHeaderProps {
  areaName: string;
  city: string;
  deliveryFee?: number;
  estimatedTime?: string;
  onChangeLocation?: () => void;
}

export function MenuHeader({
  areaName,
  city,
  deliveryFee = 149,
  estimatedTime = '35-50 min',
  onChangeLocation,
}: MenuHeaderProps) {
  return (
    <div className="bg-card border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Location Info */}
          <Button
            variant="ghost"
            onClick={onChangeLocation}
            className="gap-2 text-left h-auto py-2 px-3 -ml-3"
          >
            <MapPin className="h-5 w-5 text-primary shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Delivering to</span>
              <span className="font-semibold text-foreground">
                {areaName}, {city}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>

          {/* Delivery Info */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Truck className="h-4 w-4" />
              <span>Rs. {deliveryFee}</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{estimatedTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
