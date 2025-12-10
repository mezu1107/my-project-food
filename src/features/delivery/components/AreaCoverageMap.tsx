import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { createMap, addMarker, addPolygon } from '@/lib/map';
import { Area } from '../types/area.types';
import { useDeliveryStore } from '../store/deliveryStore';
import 'maplibre-gl/dist/maplibre-gl.css';

interface AreaCoverageMapProps {
  areas?: Area[];
  onLocationSelect?: (lat: number, lng: number) => void;
  showUserLocation?: boolean;
  interactive?: boolean;
  height?: string;
}

export const AreaCoverageMap = ({
  areas = [],
  onLocationSelect,
  showUserLocation = true,
  interactive = true,
  height = '400px',
}: AreaCoverageMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const userMarker = useRef<maplibregl.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const { userLocation, selectedArea } = useDeliveryStore();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Default to Lahore center
    const center: [number, number] = userLocation
      ? [userLocation.lng, userLocation.lat]
      : [74.3587, 31.5204];

    map.current = createMap(mapContainer.current, {
      center,
      zoom: 12,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Click handler for location selection
    if (interactive && onLocationSelect) {
      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        onLocationSelect(lat, lng);
      });
    }

    map.current.on('load', () => {
      setIsLoaded(true);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Add area polygons
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    areas.forEach((area) => {
      if (area.polygon && area.isActive) {
        addPolygon(map.current!, area.polygon.coordinates, `area-${area._id}`);
      }
    });
  }, [areas, isLoaded, selectedArea]);

  // Update user location marker
  useEffect(() => {
    if (!map.current || !showUserLocation || !userLocation) return;

    if (userMarker.current) {
      userMarker.current.remove();
    }

    userMarker.current = addMarker(
      map.current,
      [userLocation.lng, userLocation.lat],
      {
        color: 'hsl(var(--primary))',
        draggable: !!onLocationSelect,
      }
    );

    if (onLocationSelect) {
      userMarker.current.on('dragend', () => {
        const lngLat = userMarker.current!.getLngLat();
        onLocationSelect(lngLat.lat, lngLat.lng);
      });
    }

    // Fly to user location
    map.current.flyTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: 14,
    });
  }, [userLocation, showUserLocation, onLocationSelect, isLoaded]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-border">
      <div ref={mapContainer} style={{ height }} className="w-full" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-sm bg-green-500/30 border border-green-500" />
          <span>Delivery area</span>
        </div>
        {selectedArea && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-primary/30 border border-primary" />
            <span>Your area</span>
          </div>
        )}
      </div>
    </div>
  );
};
