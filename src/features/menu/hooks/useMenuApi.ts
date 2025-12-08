// src/features/menu/hooks/useMenuApi.ts
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import type {
  MenuItem,
  MenuByLocationResponse,
  MenuFiltersResponse,
  AdminMenuResponse,
  MenuFilterParams,
  CreateMenuItemPayload,
  UpdateMenuItemPayload,
  FullMenuCatalogResponse,
  SingleMenuItemResponse,
  MenuMutationResponse,
  MenuDeleteResponse,
  MenuByAreaResponse,
} from '../types/menu.types';

// ==================== PUBLIC HOOKS ====================

export function useMenuByArea(areaId: string | undefined) {
  return useQuery<MenuByAreaResponse, Error>({
    queryKey: ['menu', 'area', areaId],
    enabled: !!areaId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!areaId) throw new Error('Area ID is required');
      const data = await apiClient.get<MenuByAreaResponse>(`/menu/area/${areaId}`);
      if (!data.success) throw new Error(data.message || 'Failed to load menu');
      return data;
    },
  });
}

export function useMenuByLocation(lat: number | null, lng: number | null) {
  return useQuery<MenuByLocationResponse, Error>({
    queryKey: ['menu', 'location', lat, lng],
    enabled: lat !== null && lng !== null,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    queryFn: async () => {
      const data = await apiClient.get<MenuByLocationResponse>('/menu/location', {
        params: { lat, lng },
      });
      return data; // ← your apiClient already returns .data
    },
  });
}

// ==================== FILTERS (Infinite Query for pagination) ====================


export function useMenuFilters(params: MenuFilterParams = {}) {
  return useInfiniteQuery<MenuFiltersResponse, Error>({
    queryKey: ['menu', 'filters', params],
    queryFn: async ({ pageParam = 1 }) => {
      const processedParams = {
        limit: params.limit ?? 20,
        page: pageParam,
        search: params.search?.trim() || undefined,
        category: params.category || undefined,
        isVeg: params.isVeg !== undefined ? String(params.isVeg) : undefined,
        isSpicy: params.isSpicy !== undefined ? String(params.isSpicy) : undefined,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        sort: params.sort || 'category_asc',
        availableOnly: params.availableOnly !== false ? 'true' : 'false',
      };

      const data = await apiClient.get<MenuFiltersResponse>('/menu/filters', {
        params: processedParams,
      });

      if (!data.success) throw new Error('Failed to load filtered menu');
      return data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000,
  });
}


// ==================== FULL CATALOG ====================

export function useFullMenuCatalog() {
  return useQuery<FullMenuCatalogResponse, Error>({
    queryKey: ['menu', 'catalog'],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const data = await apiClient.get<FullMenuCatalogResponse>('/menu/all');
      if (!data.success) throw new Error(data.message || 'Failed to load catalog');
      return data;
    },
  });
}

// ==================== SINGLE ITEM ====================

export function useMenuItem(id: string | undefined) {
  return useQuery<SingleMenuItemResponse, Error>({
    queryKey: ['menu', 'item', id],
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      if (!id) throw new Error('Item ID required');
      const data = await apiClient.get<SingleMenuItemResponse>(`/menu/${id}`);
      if (!data.success) throw new Error(data.message || 'Item not found or unavailable');
      return data;
    },
  });
}

// ==================== ADMIN HOOKS ====================

export function useAdminMenuItems() {
  return useQuery<AdminMenuResponse, Error>({
    queryKey: ['menu', 'admin', 'all'],
    staleTime: 60 * 1000,
    queryFn: async () => {
      const data = await apiClient.get<AdminMenuResponse>('/menu/admin/all');
      if (!data.success) throw new Error('Failed to load admin menu');
      return data;
    },
  });
}

export function useCreateMenuItem() {
  const qc = useQueryClient();
  return useMutation<MenuMutationResponse, Error, CreateMenuItemPayload>({
    mutationFn: async (payload) => {
      const fd = new FormData();
      fd.append('name', payload.name);
      fd.append('price', String(payload.price));
      fd.append('category', payload.category);
      if (payload.description) fd.append('description', payload.description);
      if (payload.isVeg !== undefined) fd.append('isVeg', String(payload.isVeg));
      if (payload.isSpicy !== undefined) fd.append('isSpicy', String(payload.isSpicy));
      payload.availableInAreas?.forEach((id) => fd.append('availableInAreas', id));
      fd.append('image', payload.image);

      return apiClient.post<MenuMutationResponse>('/menu', fd);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['menu'] });
      qc.invalidateQueries({ queryKey: ['menu', 'admin'] });
      toast.success(data.message || 'Item created successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create item');
    },
  });
}

export function useUpdateMenuItem() {
  const qc = useQueryClient();
  return useMutation<MenuMutationResponse, Error, { id: string; data: UpdateMenuItemPayload }>({
    mutationFn: async ({ id, data }) => {
      const fd = new FormData();
      if (data.name !== undefined) fd.append('name', data.name);
      if (data.description !== undefined) fd.append('description', data.description ?? '');
      if (data.price !== undefined) fd.append('price', String(data.price));
      if (data.category !== undefined) fd.append('category', data.category);
      if (data.isVeg !== undefined) fd.append('isVeg', String(data.isVeg));
      if (data.isSpicy !== undefined) fd.append('isSpicy', String(data.isSpicy));
      if (data.isAvailable !== undefined) fd.append('isAvailable', String(data.isAvailable));
      data.availableInAreas?.forEach((areaId) => fd.append('availableInAreas', areaId));
      if (data.image) fd.append('image', data.image);

      return apiClient.put<MenuMutationResponse>(`/menu/${id}`, fd);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['menu'] });
      qc.invalidateQueries({ queryKey: ['menu', 'admin'] });
      qc.invalidateQueries({ queryKey: ['menu', 'item'] });
      toast.success(data.message || 'Updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Update failed');
    },
  });
}

export function useDeleteMenuItem() {
  const qc = useQueryClient();
  return useMutation<MenuDeleteResponse, Error, string>({
    mutationFn: async (id) => apiClient.delete<MenuDeleteResponse>(`/menu/${id}`),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['menu'] });
      qc.invalidateQueries({ queryKey: ['menu', 'admin'] });
      toast.success(data.message || 'Item deleted');
    },
    onError: () => toast.error('Failed to delete item'),
  });
}

export function useToggleMenuAvailability() {
  const qc = useQueryClient();
  return useMutation<MenuMutationResponse, Error, { id: string; isAvailable: boolean }>({
    mutationFn: async ({ id, isAvailable }) =>
      apiClient.patch<MenuMutationResponse>(`/menu/${id}/toggle`, { isAvailable }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['menu'] });
      qc.invalidateQueries({ queryKey: ['menu', 'admin'] });
      toast.success(data.message || 'Availability updated');
    },
    onError: () => toast.error('Failed to update availability'),
  });
}

// ==================== AREAS ====================

export interface AreaOption {
  id: string;
  name: string;
  city: string;
}

export function useAvailableAreas() {
  return useQuery<{ areas: AreaOption[] }, Error>({
    queryKey: ['areas', 'list'],
    staleTime: 10 * 60 * 1000,
    placeholderData: { areas: [] },
    queryFn: async () => {
      const data = await apiClient.get<{ areas: { _id: string; name: string; city: string }[] }>('/areas');
      return {
        areas: data.areas.map((a) => ({
          id: a._id,
          name: a.name,
          city: a.city,
        })),
      };
    },
  });
}
