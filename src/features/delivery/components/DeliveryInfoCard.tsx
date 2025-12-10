import { Clock, Truck, CreditCard, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrentDeliveryArea } from '../hooks/useCurrentDeliveryArea';

interface DeliveryInfoCardProps {
  showArea?: boolean;
}

export const DeliveryInfoCard = ({ showArea = true }: DeliveryInfoCardProps) => {
  const {
    areaName,
    cityName,
    estimatedTime,
    formattedFee,
    formattedMinOrder,
    isDeliverable,
  } = useCurrentDeliveryArea();

  if (!isDeliverable) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {showArea && areaName && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Delivering to</p>
                <p className="font-semibold">{areaName}, {cityName}</p>
              </div>
            </div>
          )}

          {estimatedTime && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Delivery time</p>
                <p className="font-semibold">{estimatedTime}</p>
              </div>
            </div>
          )}

          {formattedFee && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Delivery fee</p>
                <p className="font-semibold">{formattedFee}</p>
              </div>
            </div>
          )}

          {formattedMinOrder && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Min. order</p>
                <p className="font-semibold">{formattedMinOrder}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
