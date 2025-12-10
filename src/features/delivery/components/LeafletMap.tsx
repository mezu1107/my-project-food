import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import type { Area, GeoJSONPolygon } from '../types/delivery.types';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LeafletMapProps {
  areas: Area[];
  onAreaClick?: (area: Area) => void;
  onMapClick?: (lat: number, lng: number) => void;
  onPolygonDrawn?: (polygon: GeoJSONPolygon, center: { lat: number; lng: number }) => void;
  selectedAreaId?: string | null;
  enableDraw?: boolean;
  editingPolygon?: GeoJSONPolygon | null;
  className?: string;
}

export const LeafletMap = ({
  areas,
  onAreaClick,
  onMapClick,
  onPolygonDrawn,
  selectedAreaId,
  enableDraw = false,
  editingPolygon,
  className = '',
}: LeafletMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polygonLayersRef = useRef<Map<string, L.Polygon>>(new Map());
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup());

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: [31.5204, 74.3587], // Lahore center
      zoom: 12,
      zoomControl: true,
    });

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Add drawn items layer
    mapRef.current.addLayer(drawnItemsRef.current);

    // Handle map clicks
    mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle draw control
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing draw control
    if (drawControlRef.current) {
      mapRef.current.removeControl(drawControlRef.current);
      drawControlRef.current = null;
    }

    if (enableDraw) {
      drawControlRef.current = new L.Control.Draw({
        position: 'topright',
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
            shapeOptions: {
              color: '#00c853',
              weight: 3,
              fillOpacity: 0.2,
            },
          },
          polyline: false,
          circle: false,
          circlemarker: false,
          marker: false,
          rectangle: false,
        },
        edit: {
          featureGroup: drawnItemsRef.current,
          remove: true,
        },
      });

      mapRef.current.addControl(drawControlRef.current);

      // Handle polygon created
      mapRef.current.on(L.Draw.Event.CREATED, (e: any) => {
        const layer = e.layer as L.Polygon;
        drawnItemsRef.current.clearLayers();
        drawnItemsRef.current.addLayer(layer);

        const latlngs = layer.getLatLngs()[0] as L.LatLng[];
        const coordinates = latlngs.map((ll) => [ll.lng, ll.lat] as [number, number]);
        
        // Close the polygon
        if (coordinates.length > 0 && 
            (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
             coordinates[0][1] !== coordinates[coordinates.length - 1][1])) {
          coordinates.push([...coordinates[0]] as [number, number]);
        }

        // Calculate center
        const bounds = layer.getBounds();
        const center = bounds.getCenter();

        const polygon: GeoJSONPolygon = {
          type: 'Polygon',
          coordinates: [coordinates],
        };

        onPolygonDrawn?.(polygon, { lat: center.lat, lng: center.lng });
      });

      // Handle polygon edited
      mapRef.current.on(L.Draw.Event.EDITED, (e: any) => {
        const layers = e.layers;
        layers.eachLayer((layer: L.Polygon) => {
          const latlngs = layer.getLatLngs()[0] as L.LatLng[];
          const coordinates = latlngs.map((ll) => [ll.lng, ll.lat] as [number, number]);
          
          if (coordinates.length > 0 && 
              (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
               coordinates[0][1] !== coordinates[coordinates.length - 1][1])) {
            coordinates.push([...coordinates[0]] as [number, number]);
          }

          const bounds = layer.getBounds();
          const center = bounds.getCenter();

          const polygon: GeoJSONPolygon = {
            type: 'Polygon',
            coordinates: [coordinates],
          };

          onPolygonDrawn?.(polygon, { lat: center.lat, lng: center.lng });
        });
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off(L.Draw.Event.CREATED);
        mapRef.current.off(L.Draw.Event.EDITED);
      }
    };
  }, [enableDraw, onPolygonDrawn]);

  // Render area polygons
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing polygon layers
    polygonLayersRef.current.forEach((layer) => {
      mapRef.current?.removeLayer(layer);
    });
    polygonLayersRef.current.clear();

    // Add area polygons
    areas.forEach((area) => {
      if (!area.polygon?.coordinates?.[0]) return;

      // Convert [lng, lat] to [lat, lng] for Leaflet
      const latlngs: L.LatLngExpression[] = area.polygon.coordinates[0].map(
        ([lng, lat]) => [lat, lng] as L.LatLngExpression
      );

      const isSelected = selectedAreaId === area._id;
      const isActive = area.isActive;

      const polygon = L.polygon(latlngs, {
        color: isSelected ? '#2196F3' : isActive ? '#00c853' : '#d32f2f',
        weight: isSelected ? 4 : 2,
        fillColor: isActive ? '#00c853' : 'transparent',
        fillOpacity: isActive ? 0.15 : 0,
        dashArray: isActive ? undefined : '8, 8',
      }).addTo(mapRef.current!);

      // Add tooltip
      polygon.bindTooltip(
        `<strong>${area.name}</strong><br/>${area.city}<br/>${isActive ? '✓ Active' : '✗ Inactive'}`,
        { sticky: true }
      );

      // Handle click
      polygon.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onAreaClick?.(area);
      });

      polygonLayersRef.current.set(area._id, polygon);
    });
  }, [areas, selectedAreaId, onAreaClick]);

  // Handle editing polygon (for edit modal)
  useEffect(() => {
    if (!mapRef.current) return;

    drawnItemsRef.current.clearLayers();

    if (editingPolygon?.coordinates?.[0]) {
      const latlngs: L.LatLngExpression[] = editingPolygon.coordinates[0].map(
        ([lng, lat]) => [lat, lng] as L.LatLngExpression
      );

      const polygon = L.polygon(latlngs, {
        color: '#2196F3',
        weight: 3,
        fillOpacity: 0.2,
      });

      drawnItemsRef.current.addLayer(polygon);

      // Fit map to polygon
      mapRef.current.fitBounds(polygon.getBounds(), { padding: [50, 50] });
    }
  }, [editingPolygon]);

  return (
    <div
      ref={mapContainerRef}
      className={`w-full h-full rounded-lg ${className}`}
      style={{ minHeight: '400px' }}
    />
  );
};
