import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { 
  Area, 
  DeliveryZone,
  CreateAreaPayload, 
  UpdateAreaPayload, 
  UpdateDeliveryZonePayload,
  DeliveryCheckResponse,
  AdminAreasResponse,
  AdminAreaByIdResponse,
  LatLng,
} from '../types/delivery.types';
import { 
  MOCK_AREAS, 
  MOCK_DELIVERY_ZONES, 
  findAreaByCoordinates,
  getDeliveryZoneForArea 
} from '../data/mockAreas';

// Simulated delay for realistic feel
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory store for mock data mutations
let mockAreasStore = [...MOCK_AREAS];
let mockZonesStore = [...MOCK_DELIVERY_ZONES];

// ==================== ADMIN: GET ALL AREAS ====================
// GET /api/admin/areas
export const useAdminAreasQuery = (params?: { page?: number; limit?: number; city?: string; active?: boolean }) => {
  return useQuery({
    queryKey: ['admin', 'areas', params],
    queryFn: async (): Promise<Area[]> => {
      await delay(300);
      
      let filtered = [...mockAreasStore];
      
      if (params?.city) {
        filtered = filtered.filter(a => a.city.toLowerCase().includes(params.city!.toLowerCase()));
      }
      if (params?.active !== undefined) {
        filtered = filtered.filter(a => a.isActive === params.active);
      }
      
      // Return areas with polygon data for map rendering
      return filtered.sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      
      // Real API call:
      // const { data } = await api.get<AdminAreasResponse>('/admin/areas', { params });
      // return data.areas;
    },
  });
};

// ==================== ADMIN: GET SINGLE AREA ====================
// GET /api/admin/area/:id
export const useAdminAreaByIdQuery = (id: string | null) => {
  return useQuery({
    queryKey: ['admin', 'area', id],
    queryFn: async (): Promise<AdminAreaByIdResponse> => {
      await delay(200);
      
      const area = mockAreasStore.find(a => a._id === id);
      if (!area) throw new Error('Area not found');
      
      const deliveryZone = getDeliveryZoneForArea(id!);
      
      return {
        success: true,
        area,
        deliveryZone
      };
      
      // Real API call:
      // const { data } = await api.get<AdminAreaByIdResponse>(`/admin/area/${id}`);
      // return data;
    },
    enabled: !!id,
  });
};

// ==================== ADMIN: CREATE AREA ====================
// POST /api/admin/area
export const useCreateAreaMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: CreateAreaPayload): Promise<Area> => {
      await delay(500);
      
      // Validate name uniqueness
      const existing = mockAreasStore.find(
        a => a.name.toLowerCase() === payload.name.toLowerCase() && 
             a.city.toUpperCase() === (payload.city || 'LAHORE').toUpperCase()
      );
      if (existing) {
        throw new Error('Area with this name already exists in the city');
      }
      
      // Convert frontend format to MongoDB format
      // Frontend sends center as { lat, lng }
      // Frontend sends polygon coordinates as [[lat, lng], ...]
      // Backend converts to MongoDB [lng, lat] format
      const newArea: Area = {
        _id: `area_${Date.now()}`,
        name: payload.name.trim(),
        city: (payload.city || 'Lahore').toUpperCase(),
        center: {
          type: 'Point',
          coordinates: [payload.center.lng, payload.center.lat] // Convert to [lng, lat]
        },
        centerLatLng: payload.center,
        polygon: {
          type: 'Polygon',
          // Convert [[lat, lng], ...] to [[lng, lat], ...]
          coordinates: payload.polygon.coordinates.map(ring =>
            ring.map(point => [point[1], point[0]] as number[]) // Swap lat/lng
          )
        },
        isActive: false, // Only active when delivery zone is added
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockAreasStore.unshift(newArea);
      return newArea;
      
      // Real API call:
      // const { data } = await api.post<CreateAreaResponse>('/admin/area', payload);
      // return data.area;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'areas'] });
      toast.success('Area created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create area');
    },
  });
};

// ==================== ADMIN: UPDATE AREA ====================
// PUT /api/admin/area/:id
export const useUpdateAreaMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateAreaPayload }): Promise<Area> => {
      await delay(400);
      
      const index = mockAreasStore.findIndex(a => a._id === id);
      if (index === -1) throw new Error('Area not found');
      
      // Check name uniqueness if name is being updated
      if (payload.name) {
        const duplicate = mockAreasStore.find(
          a => a._id !== id && 
               a.name.toLowerCase() === payload.name!.toLowerCase() &&
               a.city === (payload.city?.toUpperCase() || mockAreasStore[index].city)
        );
        if (duplicate) {
          throw new Error('Area name already exists in this city');
        }
      }
      
      const updatedArea: Area = {
        ...mockAreasStore[index],
        ...(payload.name && { name: payload.name.trim() }),
        ...(payload.city && { city: payload.city.toUpperCase() }),
        ...(payload.center && {
          center: {
            type: 'Point',
            coordinates: [payload.center.lng, payload.center.lat]
          },
          centerLatLng: payload.center
        }),
        ...(payload.polygon && {
          polygon: {
            type: 'Polygon',
            coordinates: payload.polygon.coordinates.map(ring =>
              ring.map(point => [point[1], point[0]] as number[])
            )
          }
        }),
        updatedAt: new Date().toISOString()
      };
      
      mockAreasStore[index] = updatedArea;
      return updatedArea;
      
      // Real API call:
      // const { data } = await api.put<UpdateAreaResponse>(`/admin/area/${id}`, payload);
      // return data.area;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'areas'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'area'] });
      toast.success('Area updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update area');
    },
  });
};

// ==================== ADMIN: DELETE AREA ====================
// DELETE /api/admin/area/:id
export const useDeleteAreaMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await delay(400);
      
      const index = mockAreasStore.findIndex(a => a._id === id);
      if (index === -1) throw new Error('Area not found');
      
      // Also delete associated delivery zone
      mockZonesStore = mockZonesStore.filter(z => z.area !== id);
      mockAreasStore.splice(index, 1);
      
      // Real API call:
      // await api.delete(`/admin/area/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'areas'] });
      toast.success('Area and its delivery zone deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete area');
    },
  });
};

// ==================== ADMIN: UPDATE DELIVERY ZONE ====================
// PUT /api/admin/delivery-zone/:areaId
export const useUpdateDeliveryZoneMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      areaId, 
      payload 
    }: { 
      areaId: string; 
      payload: UpdateDeliveryZonePayload 
    }): Promise<DeliveryZone> => {
      await delay(400);
      
      const areaIndex = mockAreasStore.findIndex(a => a._id === areaId);
      if (areaIndex === -1) throw new Error('Area not found');
      
      // Find or create delivery zone
      let zoneIndex = mockZonesStore.findIndex(z => z.area === areaId);
      
      const zone: DeliveryZone = {
        _id: zoneIndex >= 0 ? mockZonesStore[zoneIndex]._id : `dz_${Date.now()}`,
        area: areaId,
        deliveryFee: payload.deliveryFee ?? 149,
        minOrderAmount: payload.minOrderAmount ?? 0,
        estimatedTime: payload.estimatedTime?.trim() ?? '35-50 min',
        isActive: payload.isActive ?? true,
        createdAt: zoneIndex >= 0 ? mockZonesStore[zoneIndex].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      if (zoneIndex >= 0) {
        mockZonesStore[zoneIndex] = zone;
      } else {
        mockZonesStore.push(zone);
      }
      
      // Update area isActive based on zone isActive
      mockAreasStore[areaIndex] = {
        ...mockAreasStore[areaIndex],
        isActive: zone.isActive,
        updatedAt: new Date().toISOString()
      };
      
      return zone;
      
      // Real API call:
      // const { data } = await api.put<UpdateDeliveryZoneResponse>(
      //   `/admin/delivery-zone/${areaId}`, 
      //   payload
      // );
      // return data.zone;
    },
    onSuccess: (zone) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'areas'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'area'] });
      toast.success(zone.isActive ? 'Delivery zone activated!' : 'Delivery zone deactivated!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update delivery zone');
    },
  });
};

// ==================== ADMIN: DELETE DELIVERY ZONE ====================
// DELETE /api/admin/delivery-zone/:areaId
export const useDeleteDeliveryZoneMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (areaId: string): Promise<void> => {
      await delay(300);
      
      const zoneIndex = mockZonesStore.findIndex(z => z.area === areaId);
      if (zoneIndex === -1) throw new Error('Delivery zone not found');
      
      mockZonesStore.splice(zoneIndex, 1);
      
      // Deactivate area
      const areaIndex = mockAreasStore.findIndex(a => a._id === areaId);
      if (areaIndex >= 0) {
        mockAreasStore[areaIndex] = {
          ...mockAreasStore[areaIndex],
          isActive: false,
          updatedAt: new Date().toISOString()
        };
      }
      
      // Real API call:
      // await api.delete(`/admin/delivery-zone/${areaId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'areas'] });
      toast.success('Delivery zone removed and area deactivated!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete delivery zone');
    },
  });
};

// ==================== PUBLIC: CHECK DELIVERY ====================
// GET /api/areas/check?lat=&lng=
export const useDeliveryCheckQuery = (lat: number | null, lng: number | null) => {
  return useQuery({
    queryKey: ['delivery-check', lat, lng],
    queryFn: async (): Promise<DeliveryCheckResponse> => {
      if (lat === null || lng === null) {
        throw new Error('Coordinates required');
      }
      
      await delay(300);
      
      const { area, zone } = findAreaByCoordinates(lat, lng);
      
      if (!area) {
        return {
          success: true,
          inService: false,
          message: 'Sorry, we do not deliver to this location yet'
        };
      }
      
      if (!zone) {
        return {
          success: true,
          inService: false,
          message: 'Area exists but delivery not active yet'
        };
      }
      
      return {
        success: true,
        inService: true,
        area: {
          _id: area._id,
          name: area.name,
          city: area.city,
          center: area.centerLatLng || { lat: area.center.coordinates[1], lng: area.center.coordinates[0] }
        },
        delivery: {
          fee: zone.deliveryFee,
          minOrder: zone.minOrderAmount,
          estimatedTime: zone.estimatedTime
        },
        message: 'Delivery available'
      };
      
      // Real API call:
      // const { data } = await api.get<DeliveryCheckResponse>('/areas/check', {
      //   params: { lat, lng }
      // });
      // return data;
    },
    enabled: lat !== null && lng !== null,
  });
};

// ==================== PUBLIC: GET ACTIVE AREAS ====================
// GET /api/areas
export const usePublicAreasQuery = () => {
  return useQuery({
    queryKey: ['public', 'areas'],
    queryFn: async () => {
      await delay(200);
      
      const activeAreas = mockAreasStore
        .filter(a => a.isActive)
        .map(a => ({
          _id: a._id,
          name: a.name,
          city: a.city,
          center: a.centerLatLng || { lat: a.center.coordinates[1], lng: a.center.coordinates[0] }
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      return { success: true, areas: activeAreas };
      
      // Real API call:
      // const { data } = await api.get<PublicAreasResponse>('/areas');
      // return data;
    },
  });
};

// ==================== HELPER: GET DELIVERY ZONE FOR AREA ====================
export const useAreaDeliveryZoneQuery = (areaId: string | null) => {
  return useQuery({
    queryKey: ['delivery-zone', areaId],
    queryFn: async (): Promise<DeliveryZone | null> => {
      if (!areaId) return null;
      await delay(100);
      return mockZonesStore.find(z => z.area === areaId) || null;
    },
    enabled: !!areaId,
  });
};
