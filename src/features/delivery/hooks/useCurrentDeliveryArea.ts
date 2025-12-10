import { useDeliveryStore } from '../store/deliveryStore';

export function useCurrentDeliveryArea() {
  const {
    selectedArea,
    deliveryInfo,
    isInService,
    hasChecked,
    isChecking,
  } = useDeliveryStore();

  return {
    area: selectedArea,
    delivery: deliveryInfo,
    isInService,
    isDeliverable: isInService, // Alias for backward compatibility
    hasChecked,
    isChecking,
    
    // Computed
    areaName: selectedArea?.name || null,
    cityName: selectedArea?.city || null,
    deliveryFee: deliveryInfo?.fee || 0,
    minOrder: deliveryInfo?.minOrder || 0,
    estimatedTime: deliveryInfo?.estimatedTime || null,
    
    // Formatted
    formattedFee: deliveryInfo ? `Rs. ${deliveryInfo.fee}` : null,
    formattedMinOrder: deliveryInfo ? `Rs. ${deliveryInfo.minOrder}` : null,
  };
}
