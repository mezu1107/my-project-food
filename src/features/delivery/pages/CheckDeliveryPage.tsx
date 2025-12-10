import { DeliveryChecker } from '../components/DeliveryChecker';
import { AreaCoverageMap } from '../components/AreaCoverageMap';
import { NotifyWhenAvailableForm } from '../components/NotifyWhenAvailableForm';
import { useCurrentDeliveryArea } from '../hooks/useCurrentDeliveryArea';
import { useAdminAreas } from '../hooks/useAdminAreas';

export const CheckDeliveryPage = () => {
  const { isDeliverable, hasChecked } = useCurrentDeliveryArea();
  const { data: areas } = useAdminAreas();

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">Check Delivery Availability</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <DeliveryChecker />
          
          <div className="space-y-6">
            <AreaCoverageMap areas={areas || []} height="300px" interactive={false} />
            {hasChecked && !isDeliverable && <NotifyWhenAvailableForm />}
          </div>
        </div>
      </div>
    </div>
  );
};
