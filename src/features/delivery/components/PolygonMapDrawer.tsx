import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { createMap } from '@/lib/map';
import { GeoJSONPolygon } from '../types/area.types';
import { geoJSONToLatLngs, latLngsToGeoJSON, closePolygon } from '../lib/polygonUtils';
import { Button } from '@/components/ui/button';
import { Trash2, RotateCcw, Check } from 'lucide-react';
import { toast } from 'sonner';
import 'maplibre-gl/dist/maplibre-gl.css';

interface PolygonMapDrawerProps {
  initialPolygon?: GeoJSONPolygon | null;
  onChange: (polygon: GeoJSONPolygon) => void;
  height?: string;
}

export const PolygonMapDrawer = ({
  initialPolygon,
  onChange,
  height = '350px',
}: PolygonMapDrawerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [points, setPoints] = useState<{ lat: number; lng: number }[]>(
    initialPolygon ? geoJSONToLatLngs(initialPolygon) : []
  );
  const [isDrawing, setIsDrawing] = useState(!initialPolygon);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = createMap(mapContainer.current, {
      center: [74.3587, 31.5204], // Lahore
      zoom: 12,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, []);

  // Handle map clicks for drawing
  useEffect(() => {
    if (!map.current) return;

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      if (!isDrawing) return;

      const { lng, lat } = e.lngLat;
      
      // Check Pakistan bounds
      if (lat < 23.5 || lat > 37.5 || lng < 60 || lng > 78) {
        toast.error('Point must be within Pakistan');
        return;
      }

      setPoints((prev) => [...prev, { lat, lng }]);
    };

    map.current.on('click', handleClick);
    return () => {
      map.current?.off('click', handleClick);
    };
  }, [isDrawing]);

  // Update markers and polygon visualization
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add markers for each point
    points.forEach((point, index) => {
      const el = document.createElement('div');
      el.className = 'w-4 h-4 rounded-full bg-primary border-2 border-white shadow-lg cursor-move';
      
      const marker = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat([point.lng, point.lat])
        .addTo(map.current!);

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        setPoints((prev) => {
          const updated = [...prev];
          updated[index] = { lat: lngLat.lat, lng: lngLat.lng };
          return updated;
        });
      });

      markersRef.current.push(marker);
    });

    // Update polygon layer
    const sourceId = 'polygon-source';
    const layerId = 'polygon-layer';
    const lineLayerId = 'polygon-line-layer';

    if (map.current.getSource(sourceId)) {
      if (points.length >= 3) {
        const coordinates = points.map((p) => [p.lng, p.lat]);
        const closed = closePolygon(coordinates);
        
        (map.current.getSource(sourceId) as maplibregl.GeoJSONSource).setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [closed],
          },
        });
      } else {
        (map.current.getSource(sourceId) as maplibregl.GeoJSONSource).setData({
          type: 'FeatureCollection',
          features: [],
        });
      }
    } else if (map.current.loaded()) {
      addPolygonLayers();
    } else {
      map.current.on('load', addPolygonLayers);
    }

    function addPolygonLayers() {
      if (!map.current || map.current.getSource(sourceId)) return;

      const coordinates = points.length >= 3
        ? [closePolygon(points.map((p) => [p.lng, p.lat]))]
        : [[]];

      map.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates,
          },
        },
      });

      map.current.addLayer({
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': 'hsl(var(--primary))',
          'fill-opacity': 0.2,
        },
      });

      map.current.addLayer({
        id: lineLayerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': 'hsl(var(--primary))',
          'line-width': 2,
        },
      });
    }
  }, [points]);

  // Notify parent of changes
  useEffect(() => {
    if (points.length >= 3) {
      const polygon = latLngsToGeoJSON(points);
      onChange(polygon);
    }
  }, [points, onChange]);

  const handleClear = () => {
    setPoints([]);
    setIsDrawing(true);
  };

  const handleFinishDrawing = () => {
    if (points.length < 4) {
      toast.error('Polygon must have at least 4 points');
      return;
    }
    setIsDrawing(false);
    toast.success('Polygon saved!');
  };

  const handleEditMode = () => {
    setIsDrawing(true);
  };

  return (
    <div className="space-y-3">
      <div className="relative rounded-xl overflow-hidden border border-border">
        <div ref={mapContainer} style={{ height }} className="w-full" />
        
        {/* Drawing instructions overlay */}
        {isDrawing && (
          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs">
            Click on map to add points ({points.length} added)
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={points.length === 0}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear
        </Button>
        
        {isDrawing ? (
          <Button
            type="button"
            size="sm"
            onClick={handleFinishDrawing}
            disabled={points.length < 4}
          >
            <Check className="w-4 h-4 mr-1" />
            Finish ({points.length} points)
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleEditMode}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Edit
          </Button>
        )}
      </div>
    </div>
  );
};
