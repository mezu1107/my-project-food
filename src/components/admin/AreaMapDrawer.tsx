// src/components/admin/AreaMapDrawer.tsx
import { useEffect, useRef, useCallback, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import {
  LatLngExpression,
  LatLngTuple,
  icon,
  divIcon,
  LeafletMouseEvent,
} from 'leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw/dist/leaflet.draw.js';
import 'leaflet-draw/dist/leaflet.draw-src.js';
import 'leaflet-geometryutil';

import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

// Fix default Leaflet icons for correct display
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconPng,
  iconRetinaUrl: markerIconPng,
  shadowUrl: markerShadowPng,
});

// Custom center icon
const centerIcon = icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [38, 48],
  iconAnchor: [19, 48],
  popupAnchor: [0, -48],
  className: 'animate-pulse drop-shadow-2xl border-4 border-white rounded-full',
});

// Hint icon when no polygon exists yet
const drawHintIcon = divIcon({
  html: `
    <div class="flex flex-col items-center">
      <div class="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
        Click to Draw
      </div>
      <div class="w-4 h-4 bg-green-600 rounded-full mt-2 shadow-lg"></div>
    </div>
  `,
  className: '',
  iconSize: [120, 80],
  iconAnchor: [60, 0],
});

type Center = { lat: number; lng: number };
type PolygonRing = [number, number][]; // [lng, lat]
type PolygonCoords = PolygonRing[];

// Calculate polygon area in km² and acres
const calculateArea = (ring: PolygonRing): { km2: number; acres: number } => {
  if (ring.length < 4) return { km2: 0, acres: 0 };
  // Remove last point because polygon is closed (first === last)
  const points = ring.slice(0, -1).map(([lng, lat]) => L.latLng(lat, lng));
  const areaM2 = L.GeometryUtil.geodesicArea(points);
  return {
    km2: Math.round((areaM2 / 1_000_000) * 100) / 100,
    acres: Math.round((areaM2 / 4046.86) * 100) / 100,
  };
};

interface AreaMapDrawerProps {
  center: Center;
  polygon: PolygonCoords;
  onCenterChange: (center: Center) => void;
  onPolygonChange: (polygon: PolygonCoords) => void;
  readonly?: boolean;
  showStats?: boolean;
}

/** Handles map clicks to add points to the polygon */
function MapClickHandler({
  polygon,
  onPolygonChange,
  readonly,
}: {
  polygon: PolygonCoords;
  onPolygonChange: (p: PolygonCoords) => void;
  readonly: boolean;
}) {
  useMapEvents({
    click: (e) => {
      if (readonly) return;

      const newPoint: [number, number] = [e.latlng.lng, e.latlng.lat];

      if (polygon.length === 0 || polygon[0].length === 0) {
        // Start polygon with first point duplicated (closed polygon)
        onPolygonChange([[newPoint, newPoint]]);
      } else {
        const ring = polygon[0];
        // Insert new point before last closing point
        const newCoords = [...ring.slice(0, -1), newPoint, ring[0]];
        onPolygonChange([newCoords]);
      }
    },
  });
  return null;
}

/**
 * Manages polygon drawing, editing, and marker dragging/removal
 */
function MapDrawController({
  polygon,
  onPolygonChange,
  readonly,
}: {
  polygon: PolygonCoords;
  onPolygonChange: (p: PolygonCoords) => void;
  readonly: boolean;
}) {
  const map = useMap();
  const drawnItems = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const markers = useRef<L.Marker[]>([]);
  const flowingLine = useRef<L.Polyline | null>(null);
  const animationFrame = useRef<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Animate the flowing dashed polyline
  const animatePolyline = useCallback(() => {
    if (!flowingLine.current) return;
    let offset = 0;
    const animate = () => {
      if (!flowingLine.current) return;
      offset = (offset - 1) % 25;
      flowingLine.current.setStyle({ dashOffset: `${offset}` });
      animationFrame.current = requestAnimationFrame(animate);
    };
    animate();
  }, []);

  // Clean up markers and polyline from map
  const cleanup = () => {
    markers.current.forEach((m) => map.removeLayer(m));
    markers.current = [];
    if (flowingLine.current) {
      map.removeLayer(flowingLine.current);
      flowingLine.current = null;
    }
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
  };

  // Update markers and flowing polyline based on polygon coords
  const updateMarkersAndLines = useCallback(
    (coords: PolygonRing) => {
      cleanup();

      // Create pane for flowing line if not exists
      if (!map.getPane('flowLinePane')) {
        map.createPane('flowLinePane');
        map.getPane('flowLinePane')!.style.zIndex = '650'; // Above polygon
      }

      // Create flowing polyline (lat,lng reversed for Leaflet)
      const latlngs = coords.map(([lng, lat]) => [lat, lng]) as LatLngTuple[];
      flowingLine.current = L.polyline(latlngs, {
        color: '#10b981',
        weight: 4,
        dashArray: '15,10',
        dashOffset: '0',
        opacity: 0.8,
        pane: 'flowLinePane',
      }).addTo(map);
      animatePolyline();

      // Add draggable markers (except last closing point)
      coords.slice(0, -1).forEach(([lng, lat], i) => {
        const marker = L.marker([lat, lng], {
          draggable: true,
          icon: divIcon({
            html: `
              <div class="relative">
                <div class="absolute inset-0 rounded-full ${
                  hoveredIndex === i ? 'bg-yellow-400/50 animate-pulse' : 'bg-green-500/30 animate-ping'
                }"></div>
                <div class="relative w-16 h-16 bg-white border-8 ${
                  hoveredIndex === i ? 'border-yellow-400' : 'border-green-600'
                } rounded-full flex items-center justify-center font-black text-3xl ${
                  hoveredIndex === i ? 'text-yellow-500' : 'text-green-700'
                } shadow-2xl ring-4 ring-white cursor-move transition-all duration-200 ease-out">
                  ${i + 1}
                </div>
              </div>
            `,
            className: '',
            iconSize: [64, 64],
            iconAnchor: [32, 32],
          }),
          zIndexOffset: 5000,
        });

        // Drag event throttled with requestAnimationFrame to avoid lag
        let dragging = false;
        marker.on('drag', () => {
          if (dragging) return;
          dragging = true;
          requestAnimationFrame(() => {
            dragging = false;
            const pos = marker.getLatLng();
            const newCoords = [...coords];
            newCoords[i] = [pos.lng, pos.lat];
            newCoords[newCoords.length - 1] = newCoords[0]; // Keep polygon closed
            onPolygonChange([newCoords]);
            updateMarkersAndLines(newCoords);
          });
        });

        // Hover highlight
        marker.on('mouseover', () => setHoveredIndex(i));
        marker.on('mouseout', () => setHoveredIndex(null));

        // Right-click to remove marker if at least 3 points remain
        marker.on('contextmenu', (e: LeafletMouseEvent) => {
          e.originalEvent.preventDefault();
          const newCoords = coords.filter((_, idx) => idx !== i);
          if (newCoords.length >= 3) {
            newCoords.push(newCoords[0]); // Close polygon
            onPolygonChange([newCoords]);
            updateMarkersAndLines(newCoords);
          }
        });

        marker.addTo(map);
        markers.current.push(marker);
      });
    },
    [map, onPolygonChange, animatePolyline, hoveredIndex]
  );

  useEffect(() => {
    if (readonly) return;

    // Add the feature group to the map (for leaflet-draw)
    map.addLayer(drawnItems.current);

    const control = new L.Control.Draw({
      position: 'topright',
      draw: {
        polygon: {
          shapeOptions: {
            color: '#16a34a',
            weight: 6,
            opacity: 1,
            fillColor: '#16a34a',
            fillOpacity: 0.3,
          },
          showArea: true,
          allowIntersection: false,
        },
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false,
      },
      edit: {
        featureGroup: drawnItems.current,
        remove: true,
      },
    });

    map.addControl(control);

    // Update polygon state from Leaflet layer
    const updateFromLayer = (layer: L.Polygon) => {
      const latlngs = layer.getLatLngs()[0] as L.LatLng[];
      const coords: PolygonRing = latlngs.map((ll) => [ll.lng, ll.lat]);
      coords.push(coords[0]); // close polygon
      onPolygonChange([coords]);
      updateMarkersAndLines(coords);
    };

    const onCreated = (e: any) => {
      drawnItems.current.clearLayers();
      drawnItems.current.addLayer(e.layer);
      updateFromLayer(e.layer);
    };

    const onEdited = (e: any) => {
      e.layers.eachLayer((layer: L.Layer) => {
        if (layer instanceof L.Polygon) updateFromLayer(layer);
      });
    };

    const onDeleted = () => {
      onPolygonChange([]);
      cleanup();
    };

    map.on('draw:created', onCreated);
    map.on('draw:edited', onEdited);
    map.on('draw:deleted', onDeleted);

    // Initialize markers and lines if polygon exists
    if (polygon.length > 0 && polygon[0].length >= 4) {
      updateMarkersAndLines(polygon[0]);
    }

    return () => {
      map.removeControl(control);
      map.off('draw:created', onCreated);
      map.off('draw:edited', onEdited);
      map.off('draw:deleted', onDeleted);
      cleanup();
      map.removeLayer(drawnItems.current);
    };
  }, [map, polygon, readonly, onPolygonChange, updateMarkersAndLines]);

  // Highlight nearest marker dynamically on mousemove
  useMapEvents({
    mousemove: (e: LeafletMouseEvent) => {
      if (readonly || polygon.length === 0) return;

      const coords = polygon[0];
      const latlngs = coords.slice(0, -1).map(([lng, lat]) => L.latLng(lat, lng));

      let minDist = Infinity;
      let nearestIndex: number | null = null;
      latlngs.forEach((ll, idx) => {
        const dist = ll.distanceTo(e.latlng);
        if (dist < minDist) {
          minDist = dist;
          nearestIndex = idx;
        }
      });
      setHoveredIndex(nearestIndex);
    },
  });

  return null;
}

export default function AreaMapDrawer({
  center,
  polygon,
  onCenterChange,
  onPolygonChange,
  readonly = false,
  showStats = true,
}: AreaMapDrawerProps) {
  const position: LatLngExpression = [center.lat, center.lng];
  const polygonPositions: LatLngTuple[][] = polygon.map((ring) =>
    ring.map(([lng, lat]) => [lat, lng])
  );
  const { km2, acres } = polygon.length > 0 ? calculateArea(polygon[0]) : { km2: 0, acres: 0 };

  return (
    <div className="relative rounded-3xl overflow-hidden border-8 border-green-600 shadow-3xl bg-gray-900">
      <MapContainer
        center={position}
        zoom={14}
        scrollWheelZoom={!readonly}
        className="h-96 md:h-screen max-h-screen w-full rounded-3xl"
        zoomControl={!readonly}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        <MapClickHandler
          polygon={polygon}
          onPolygonChange={onPolygonChange}
          readonly={readonly}
        />
        <MapDrawController polygon={polygon} onPolygonChange={onPolygonChange} readonly={readonly} />

        {polygonPositions.length > 0 && polygonPositions[0].length >= 4 && (
          <Polygon
            positions={polygonPositions}
            pathOptions={{
              color: '#16a34a',
              weight: 6,
              opacity: 1,
              fillColor: '#16a34a',
              fillOpacity: 0.3,
            }}
          />
        )}

        <Marker position={position} icon={centerIcon}>
          <div className="text-center">
            <div className="bg-white px-4 py-2 rounded-full shadow-2xl font-black text-green-700">
              Delivery Center
            </div>
          </div>
        </Marker>

        {!readonly && polygon.length === 0 && <Marker position={position} icon={drawHintIcon} />}
      </MapContainer>

      {showStats && polygon.length > 0 && (
        <div className="absolute bottom-6 right-6 z-10 bg-gradient-to-br from-black/90 to-black/80 text-white px-6 py-4 rounded-3xl shadow-2xl border border-green-500 backdrop-blur-lg">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs opacity-80">Area</p>
              <p className="font-black text-2xl">{km2} km²</p>
            </div>
            <div className="w-px h-12 bg-green-500/50" />
            <div className="text-center">
              <p className="text-xs opacity-80">Acres</p>
              <p className="font-black text-2xl">{acres}</p>
            </div>
            <div className="w-px h-12 bg-green-500/50" />
            <div className="text-center">
              <p className="text-xs opacity-80">Points</p>
              <p className="font-black text-2xl flex items-center gap-2">
                {polygon[0]?.length || 0}{' '}
                <span className="text-green-400 text-sm font-bold">1,2,3...</span>
              </p>
            </div>
          </div>
          <p className="text-center text-xs mt-2 opacity-80">
            {polygon[0]?.length >= 4 ? 'Valid Zone' : 'Incomplete'}
          </p>
        </div>
      )}
    </div>
  );
}
