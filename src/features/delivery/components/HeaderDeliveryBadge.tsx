import { MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentDeliveryArea } from '../hooks/useCurrentDeliveryArea';
import { useDeliveryStore } from '../store/deliveryStore';

interface HeaderDeliveryBadgeProps {
  variant?: 'default' | 'minimal';
}

export const HeaderDeliveryBadge = ({ variant = 'default' }: HeaderDeliveryBadgeProps) => {
  const { areaName, cityName, isDeliverable, hasChecked } = useCurrentDeliveryArea();
  const { setShowModal } = useDeliveryStore();

  if (variant === 'minimal') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowModal(true)}
        className="text-muted-foreground hover:text-foreground"
      >
        <MapPin className="w-4 h-4 mr-1" />
        {isDeliverable && areaName ? areaName : 'Set location'}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={() => setShowModal(true)}
      className="h-10 px-3 gap-2 rounded-full border-border/50 hover:border-primary/50"
    >
      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
        <MapPin className="w-3.5 h-3.5 text-primary" />
      </div>
      
      <div className="text-left">
        {isDeliverable && areaName ? (
          <>
            <p className="text-xs font-medium leading-none">{areaName}</p>
            <p className="text-[10px] text-muted-foreground">{cityName}</p>
          </>
        ) : hasChecked ? (
          <p className="text-xs font-medium text-destructive">Not available</p>
        ) : (
          <p className="text-xs font-medium">Set location</p>
        )}
      </div>
      
      <ChevronDown className="w-4 h-4 text-muted-foreground" />
    </Button>
  );
};
