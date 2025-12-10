import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Area, CreateAreaPayload, UpdateAreaPayload } from '../types/area.types';
import { toast } from 'sonner';

// Mock data for development
const mockAreas: Area[] = [
  {
    _id: '1',
    name: 'Gulberg',
    city: 'Lahore',
    isActive: true,
    center: { lat: 31.5204, lng: 74.3587 },
    polygon: {
      type: 'Polygon',
      coordinates: [[[74.33, 31.51], [74.38, 31.51], [74.38, 31.54], [74.33, 31.54], [74.33, 31.51]]],
    },
  },
  {
    _id: '2',
    name: 'DHA',
    city: 'Lahore',
    isActive: true,
    center: { lat: 31.4697, lng: 74.4063 },
    polygon: {
      type: 'Polygon',
      coordinates: [[[74.38, 31.45], [74.44, 31.45], [74.44, 31.49], [74.38, 31.49], [74.38, 31.45]]],
    },
  },
  {
    _id: '3',
    name: 'Johar Town',
    city: 'Lahore',
    isActive: true,
    center: { lat: 31.4697, lng: 74.2975 },
    polygon: {
      type: 'Polygon',
      coordinates: [[[74.27, 31.45], [74.32, 31.45], [74.32, 31.49], [74.27, 31.49], [74.27, 31.45]]],
    },
  },
  {
    _id: '4',
    name: 'Model Town',
    city: 'Lahore',
    isActive: false,
    center: { lat: 31.4833, lng: 74.3167 },
    polygon: {
      type: 'Polygon',
      coordinates: [[[74.30, 31.47], [74.34, 31.47], [74.34, 31.50], [74.30, 31.50], [74.30, 31.47]]],
    },
  },
];

export function useAdminAreas() {
  return useQuery({
    queryKey: ['admin', 'areas'],
    queryFn: async () => {
      // Use mock data for development
      const useMock = !import.meta.env.VITE_API_URL;
      
      if (useMock) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockAreas;
      }
      
      const { data } = await api.get<Area[]>('/area');
      return data;
    },
  });
}

export function useCreateArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAreaPayload) => {
      // Use mock for development
      const useMock = !import.meta.env.VITE_API_URL;
      
      if (useMock) {
        await new Promise(resolve => setTimeout(resolve, 800));
        const newArea: Area = {
          _id: Date.now().toString(),
          ...payload,
          city: payload.city || 'Lahore',
          isActive: false,
          createdAt: new Date().toISOString(),
        };
        return newArea;
      }
      
      const { data } = await api.post<Area>('/area', payload);
      return data;
    },
    onSuccess: (newArea) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'areas'] });
      toast.success('Area created!', {
        description: `${newArea.name} has been added`,
      });
    },
    onError: (error: any) => {
      toast.error('Failed to create area', {
        description: error.response?.data?.message || 'Please try again',
      });
    },
  });
}

export function useUpdateArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateAreaPayload }) => {
      // Use mock for development
      const useMock = !import.meta.env.VITE_API_URL;
      
      if (useMock) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { _id: id, ...payload } as Area;
      }
      
      const { data } = await api.put<Area>(`/area/${id}`, payload);
      return data;
    },
    onSuccess: (updatedArea) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'areas'] });
      toast.success('Area updated!');
    },
    onError: (error: any) => {
      toast.error('Failed to update area', {
        description: error.response?.data?.message || 'Please try again',
      });
    },
  });
}

export function useDeleteArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Use mock for development
      const useMock = !import.meta.env.VITE_API_URL;
      
      if (useMock) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true };
      }
      
      const { data } = await api.delete(`/area/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'areas'] });
      toast.success('Area deleted!');
    },
    onError: (error: any) => {
      toast.error('Failed to delete area', {
        description: error.response?.data?.message || 'Please try again',
      });
    },
  });
}

export function useToggleAreaStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      // Use mock for development
      const useMock = !import.meta.env.VITE_API_URL;
      
      if (useMock) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return { _id: id, isActive } as Area;
      }
      
      const { data } = await api.patch<Area>(`/area/${id}/toggle`, { isActive });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'areas'] });
      toast.success(data.isActive ? 'Area activated!' : 'Area deactivated');
    },
    onError: (error: any) => {
      toast.error('Failed to update status', {
        description: error.response?.data?.message || 'Please try again',
      });
    },
  });
}
