import { GeoJSONPolygon, AreaCenter } from '../types/area.types';

/**
 * Validates that a polygon has at least 4 points and is properly closed
 */
export function validatePolygon(polygon: GeoJSONPolygon): { valid: boolean; error?: string } {
  if (!polygon || polygon.type !== 'Polygon') {
    return { valid: false, error: 'Invalid polygon type' };
  }

  if (!polygon.coordinates || !Array.isArray(polygon.coordinates) || polygon.coordinates.length === 0) {
    return { valid: false, error: 'Polygon must have at least one ring' };
  }

  const ring = polygon.coordinates[0];
  
  if (!Array.isArray(ring) || ring.length < 4) {
    return { valid: false, error: 'Polygon must have at least 4 points' };
  }

  // Check each point is [lng, lat]
  for (const point of ring) {
    if (!Array.isArray(point) || point.length !== 2) {
      return { valid: false, error: 'Each point must be [lng, lat]' };
    }
    const [lng, lat] = point;
    if (typeof lng !== 'number' || typeof lat !== 'number') {
      return { valid: false, error: 'Coordinates must be numbers' };
    }
    // Pakistan bounds check
    if (lat < 23.5 || lat > 37.5) {
      return { valid: false, error: 'Latitude must be between 23.5 and 37.5 (Pakistan)' };
    }
    if (lng < 60.0 || lng > 78.0) {
      return { valid: false, error: 'Longitude must be between 60 and 78 (Pakistan)' };
    }
  }

  return { valid: true };
}

/**
 * Ensures the polygon ring is properly closed (first point equals last point)
 */
export function closePolygon(coordinates: number[][]): number[][] {
  if (coordinates.length === 0) return coordinates;
  
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  
  if (first[0] !== last[0] || first[1] !== last[1]) {
    return [...coordinates, first];
  }
  
  return coordinates;
}

/**
 * Calculates the center (centroid) of a polygon
 */
export function calculatePolygonCenter(coordinates: number[][]): AreaCenter {
  if (coordinates.length === 0) {
    // Default to Lahore center
    return { lat: 31.5204, lng: 74.3587 };
  }

  let sumLng = 0;
  let sumLat = 0;
  const count = coordinates.length;

  for (const [lng, lat] of coordinates) {
    sumLng += lng;
    sumLat += lat;
  }

  return {
    lng: sumLng / count,
    lat: sumLat / count,
  };
}

/**
 * Checks if a point is inside a polygon using ray casting algorithm
 */
export function isPointInPolygon(lat: number, lng: number, polygon: GeoJSONPolygon): boolean {
  const ring = polygon.coordinates[0];
  if (!ring || ring.length < 4) return false;

  let inside = false;
  const x = lng;
  const y = lat;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    if (((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Converts Leaflet LatLng array to GeoJSON polygon format
 */
export function latLngsToGeoJSON(latLngs: { lat: number; lng: number }[]): GeoJSONPolygon {
  const coordinates = latLngs.map(p => [p.lng, p.lat]);
  const closedCoordinates = closePolygon(coordinates);
  
  return {
    type: 'Polygon',
    coordinates: [closedCoordinates],
  };
}

/**
 * Converts GeoJSON polygon to Leaflet LatLng array
 */
export function geoJSONToLatLngs(polygon: GeoJSONPolygon): { lat: number; lng: number }[] {
  const ring = polygon.coordinates[0] || [];
  return ring.map(([lng, lat]) => ({ lat, lng }));
}

/**
 * Calculates approximate area of polygon in square kilometers
 */
export function calculatePolygonArea(coordinates: number[][]): number {
  if (coordinates.length < 3) return 0;

  let area = 0;
  const n = coordinates.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += coordinates[i][0] * coordinates[j][1];
    area -= coordinates[j][0] * coordinates[i][1];
  }

  area = Math.abs(area) / 2;
  
  // Convert to approximate km² (rough conversion for Pakistan's latitude)
  const kmPerDegree = 111;
  return area * kmPerDegree * kmPerDegree;
}
