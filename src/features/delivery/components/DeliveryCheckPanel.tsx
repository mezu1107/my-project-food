import { useState } from 'react';
import { MapPin, Search, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDeliveryCheckQuery } from '../hooks/useAdminAreasApi';

interface DeliveryCheckPanelProps {
  clickedCoords: { lat: number; lng: number } | null;
}

export const DeliveryCheckPanel = ({ clickedCoords }: DeliveryCheckPanelProps) => {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [checkCoords, setCheckCoords] = useState<{ lat: number; lng: number } | null>(null);

  const { data, isLoading, isError } = useDeliveryCheckQuery(
    checkCoords?.lat ?? null,
    checkCoords?.lng ?? null
  );

  // Update inputs when map is clicked
  const handleMapClick = () => {
    if (clickedCoords) {
      setLat(clickedCoords.lat.toFixed(6));
      setLng(clickedCoords.lng.toFixed(6));
    }
  };

  // Auto-update when clickedCoords changes
  if (clickedCoords && lat !== clickedCoords.lat.toFixed(6)) {
    setLat(clickedCoords.lat.toFixed(6));
    setLng(clickedCoords.lng.toFixed(6));
  }

  const handleCheck = () => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    
    if (isNaN(latNum) || isNaN(lngNum)) return;
    if (latNum < 23.5 || latNum > 37.5 || lngNum < 60 || lngNum > 78) return;
    
    setCheckCoords({ lat: latNum, lng: lngNum });
  };

  return (
    <Card className="w-80 shadow-xl border-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          Delivery Check Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Latitude</label>
            <Input
              type="number"
              step="any"
              placeholder="31.5204"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Longitude</label>
            <Input
              type="number"
              step="any"
              placeholder="74.3587"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Click anywhere on the map to auto-fill coordinates
        </p>

        <Button 
          onClick={handleCheck} 
          className="w-full gap-2"
          disabled={!lat || !lng || isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Check Delivery
        </Button>

        <AnimatePresence mode="wait">
          {checkCoords && data && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3 rounded-lg ${
                data.inService 
                  ? 'bg-green-500/10 border border-green-500/30' 
                  : 'bg-destructive/10 border border-destructive/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {data.inService ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive" />
                )}
                <span className="font-medium">
                  {data.inService ? 'In Service Area' : 'Not In Service'}
                </span>
              </div>

              {data.inService && data.area && data.delivery && (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Area:</span>
                    <span className="font-medium">{data.area.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee:</span>
                    <span className="font-medium">PKR {data.delivery.fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min Order:</span>
                    <span className="font-medium">PKR {data.delivery.minOrder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Time:</span>
                    <span className="font-medium">{data.delivery.estimatedTime}</span>
                  </div>
                </div>
              )}

              {!data.inService && (
                <p className="text-sm text-muted-foreground">
                  {data.message}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
