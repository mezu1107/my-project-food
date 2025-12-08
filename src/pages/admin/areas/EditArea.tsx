// src/pages/admin/areas/EditArea.tsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import { apiClient } from '@/lib/api';
import AreaMapDrawer from '@/components/admin/AreaMapDrawer';
import { Area } from '@/types/area';

const CITIES = ['Lahore', 'Islamabad', 'Karachi', 'Rawalpindi'] as const;
type City = typeof CITIES[number];

const editAreaSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  city: z.enum(CITIES),
  center: z.object({
    lat: z.number().min(23.5).max(37.5),
    lng: z.number().min(60.0).max(78.0),
  }),
  polygon: z
    .object({
      type: z.literal('Polygon'),
      coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))).min(1),
    })
    .optional(),
});

type EditAreaFormValues = z.infer<typeof editAreaSchema>;

export default function EditArea() {
  const { areaId } = useParams<{ areaId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<'draw' | 'manual'>('draw');

  const [center, setCenter] = useState({ lat: 31.5204, lng: 74.3587 });
  const [polygon, setPolygon] = useState<[number, number][][]>([]);
  const [manualInput, setManualInput] = useState('');

  const form = useForm<EditAreaFormValues>({
    resolver: zodResolver(editAreaSchema),
    defaultValues: {
      name: '',
      city: 'Lahore',
      center: { lat: 31.5204, lng: 74.3587 },
    },
  });

  useEffect(() => {
    const loadArea = async () => {
      if (!areaId) {
        toast.error('No area selected');
        navigate('/admin/areas');
        return;
      }

      try {
        setLoading(true);
        const areaResponse = await apiClient.get<{ area: Area }>(`/admin/area/${areaId}`);
const area: Area = areaResponse.area;


        const city: City = CITIES.includes(area.city as City) ? (area.city as City) : 'Lahore';

        const centerCoords = area.centerLatLng || {
          lat: area.center.coordinates[1],
          lng: area.center.coordinates[0],
        };

        form.reset({
          name: area.name,
          city,
          center: centerCoords,
        });

        setCenter(centerCoords);

        if (area.polygon?.coordinates?.[0]?.length >= 4) {
          // GeoJSON polygons use [lng, lat] order
          const ring = area.polygon.coordinates[0].map(([lng, lat]) => [lng, lat] as [number, number]);
          setPolygon([ring]);

          // Prepare manual input as "lat, lng" per line for textarea
          const points = ring
            .slice(0, -1) // exclude repeated last point
            .map(([lng, lat]) => `${lat}, ${lng}`)
            .join('\n');
          setManualInput(points);
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load area');
        navigate('/admin/areas');
      } finally {
        setLoading(false);
      }
    };

    loadArea();
  }, [areaId, form, navigate]);

  const parseManualPoints = () => {
    try {
      const lines = manualInput.trim().split('\n').filter(l => l.trim());
      if (lines.length < 3) throw new Error('Need at least 3 points');

      const coords: [number, number][] = lines.map((line, i) => {
        const parts = line.split(',').map(s => s.trim());
        if (parts.length !== 2) throw new Error(`Invalid format at line ${i + 1}`);

        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);

        if (isNaN(lat) || isNaN(lng)) throw new Error(`Invalid number at line ${i + 1}`);

        return [lng, lat] as [number, number]; // keep [lng, lat] order for GeoJSON
      });

      // Close the polygon ring by repeating the first point at the end
      coords.push(coords[0]);

      setPolygon([coords]);
      form.setValue('polygon', { type: 'Polygon', coordinates: [coords] });
      toast.success(`Loaded ${coords.length} points`);
    } catch (err: any) {
      toast.error(err.message || 'Invalid coordinates');
    }
  };

  const onSubmit = async (data: EditAreaFormValues) => {
    if (polygon.length === 0 || polygon[0].length < 4) {
      toast.error('Delivery zone boundary is required');
      return;
    }

    const payload = {
      name: data.name,
      city: data.city,
      normalizedCenter: { lat: data.center.lat, lng: data.center.lng },
      mongoPolygon: { type: 'Polygon', coordinates: polygon },
    };

    try {
      setSubmitting(true);
      await apiClient.put(`/admin/area/${areaId}`, payload);
      toast.success('Area updated successfully!');
      navigate('/admin/areas');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update area');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-green-600 rounded-full border-t-transparent mx-auto" />
          <p className="mt-6 text-xl font-semibold text-green-700">Loading area...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12">
      <div className="container mx-auto px-6 max-w-7xl">
        <Card className="shadow-2xl border-green-100">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-xl">
            <CardTitle className="text-4xl font-extrabold">Edit Delivery Area</CardTitle>
            <p className="text-green-100 mt-2">Update name, city, or modify the delivery boundary</p>
          </CardHeader>

          <CardContent className="pt-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Label className="text-lg font-medium">Area Name</Label>
                  <Input
                    placeholder="e.g. F-6 Super Market"
                    className="mt-2 h-12 text-lg"
                    {...form.register('name')}
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-lg font-medium">City</Label>
                  <Select
                    value={form.watch('city')}
                    onValueChange={(v) => form.setValue('city', v as City)}
                  >
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-lg font-medium">Edit Delivery Zone</Label>
                <Tabs value={mode} onValueChange={(v) => setMode(v as 'draw' | 'manual')} className="mt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="draw">Draw on Map</TabsTrigger>
                    <TabsTrigger value="manual">Enter Coordinates</TabsTrigger>
                  </TabsList>

                  <TabsContent value="draw" className="mt-6">
                    <AreaMapDrawer
                      center={center}
                      polygon={polygon}
                      onCenterChange={(c) => {
                        setCenter(c);
                        form.setValue('center', c);
                      }}
                      onPolygonChange={(p) => {
                        setPolygon(p);
                        form.setValue('polygon', { type: 'Polygon', coordinates: p });
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="manual" className="mt-6 space-y-4">
                    <Textarea
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="Paste coordinates: lat, lng per line"
                      className="font-mono text-sm h-48"
                    />
                    <Button type="button" onClick={parseManualPoints}>
                      Load to Map
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex justify-between items-center bg-gray-50 rounded-xl p-6">
                <div className="text-sm">
                  <strong>Center:</strong> {center.lat.toFixed(6)}, {center.lng.toFixed(6)}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {polygon[0]?.length || 0} points
                  </Badge>
                  {polygon.length > 0 && polygon[0].length >= 4 && (
                    <Badge variant="default" className="bg-green-600">Ready</Badge>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-8 border-t">
                <Button type="button" variant="outline" size="lg" onClick={() => navigate('/admin/areas')}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={submitting || polygon.length === 0}
                >
                  {submitting ? 'Saving...' : 'Update Area'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
