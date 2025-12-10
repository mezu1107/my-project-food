const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

export interface ReverseGeocodeResult {
  display_name: string;
  address: {
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

export interface ForwardGeocodeResult {
  lat: string;
  lon: string;
  display_name: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

/**
 * Reverse geocode coordinates to address (Pakistan focused)
 */
export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
  try {
    const response = await fetch(
      `${NOMINATIM_URL}/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&countrycodes=pk`,
      {
        headers: {
          'User-Agent': 'ZaikaExpress/1.0',
          'Accept-Language': 'en',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

/**
 * Forward geocode address to coordinates (Pakistan only)
 */
export async function forwardGeocode(query: string): Promise<ForwardGeocodeResult[]> {
  try {
    const response = await fetch(
      `${NOMINATIM_URL}/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=pk`,
      {
        headers: {
          'User-Agent': 'ZaikaExpress/1.0',
          'Accept-Language': 'en',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Forward geocoding failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Forward geocoding error:', error);
    return [];
  }
}

/**
 * Format address for display
 */
export function formatAddress(result: ReverseGeocodeResult): string {
  const { address } = result;
  const parts = [
    address.road,
    address.neighbourhood || address.suburb,
    address.city,
  ].filter(Boolean);
  
  return parts.join(', ') || result.display_name;
}
