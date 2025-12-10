import { motion } from 'framer-motion';
import { CheckCircle, Clock, MapPin, Truck } from 'lucide-react';
import { useCurrentDeliveryArea } from '../hooks/useCurrentDeliveryArea';

export const DeliveryAvailabilityBanner = () => {
  const { isDeliverable, areaName, estimatedTime, formattedMinOrder } = useCurrentDeliveryArea();

  if (!isDeliverable || !areaName) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-green-500 text-white py-2.5"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4 md:gap-8 text-sm font-medium flex-wrap">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Delivering to {areaName}!</span>
          </div>
          
          {estimatedTime && (
            <div className="hidden sm:flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{estimatedTime}</span>
            </div>
          )}
          
          {formattedMinOrder && (
            <div className="hidden md:flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span>Min. order {formattedMinOrder}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
