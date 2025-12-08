// src/components/ServiceAreaModal.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

interface DeliverableArea {
  _id: string;
  name: string;
  city: string;
  hasDeliveryZone: boolean;
  deliveryZone: {
    isActive: boolean;
    deliveryFee: number;
    estimatedTime: string;
  } | null;
}

interface ServiceAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ADD `default` HERE
export default function ServiceAreaModal({ isOpen, onClose }: ServiceAreaModalProps) {
  const [areas, setAreas] = useState<DeliverableArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<DeliverableArea | null>(null);
  const setSelectedAreaStore = useStore((state) => state.setSelectedArea);

  useEffect(() => {
    if (!isOpen) return;

    const loadAreas = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get<{ areas: DeliverableArea[] }>('/admin/areas', {
          params: { limit: 200 },
        });

        const activeAreas = data.areas.filter(
          a => a.hasDeliveryZone && a.deliveryZone?.isActive
        );
        setAreas(activeAreas);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load delivery areas');
      } finally {
        setLoading(false);
      }
    };

    loadAreas();
  }, [isOpen]);

  const handleConfirm = () => {
    if (!selectedArea) return;

    const areaData = {
      id: selectedArea._id,
      name: selectedArea.name,
      city: selectedArea.city,
      fullAddress: `${selectedArea.name}, ${selectedArea.city}`,
      deliveryFee: selectedArea.deliveryZone?.deliveryFee || 149,
      estimatedTime: selectedArea.deliveryZone?.estimatedTime || "35-50 min",
    };

    setSelectedAreaStore(areaData);
    toast.success(`Delivering to ${selectedArea.name}!`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-card rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-border"
      >
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <MapPin className="h-8 w-8" />
                Select Delivery Area
              </h2>
              <p className="text-green-100 mt-1">Choose where you want food delivered</p>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto" />
              <p className="mt-4 text-muted-foreground">Loading available areas...</p>
            </div>
          ) : areas.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No delivery areas available yet</p>
              <p className="text-sm text-muted-foreground mt-2">We're expanding soon!</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {areas.map((area) => (
                  <button
                    key={area._id}
                    onClick={() => setSelectedArea(area)}
                    className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                      selectedArea?._id === area._id
                        ? "border-green-500 bg-green-50 shadow-lg scale-105"
                        : "border-border hover:border-green-300 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${selectedArea?._id === area._id ? "bg-green-600" : "bg-gray-200"}`}>
                          <MapPin className={`h-6 w-6 ${selectedArea?._id === area._id ? "text-white" : "text-gray-600"}`} />
                        </div>
                        <div>
                          <p className="font-bold text-lg">{area.name}</p>
                          <p className="text-sm text-muted-foreground">{area.city}</p>
                        </div>
                      </div>
                      {selectedArea?._id === area._id && (
                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <Button
                onClick={handleConfirm}
                disabled={!selectedArea}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                size="lg"
              >
                {selectedArea ? (
                  <>
                    Deliver to {selectedArea.name}
                    <svg className="ml-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                ) : (
                  "Please select an area"
                )}
              </Button>
            </>
          )}

          <p className="text-center text-xs text-muted-foreground mt-4">
            More areas coming soon!
          </p>
        </div>
      </motion.div>
    </div>
  );
}