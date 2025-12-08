// src/pages/admin/areas/AddArea.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
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

const CITIES = ['Lahore', 'Islamabad', 'Karachi', 'Rawalpindi'] as const;
type City = typeof CITIES[number];

// Fixed: polygon is REQUIRED for creation
const areaSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  city: z.enum(CITIES),
  center: z.object({
    lat: z.number().min(23.5, 'Latitude too low').max(37.5, 'Latitude too high'),
    lng: z.number().min(60.0, 'Longitude too low').max(78.0, 'Longitude too high'),
  }),
  polygon: z.object({
    type: z.literal('Polygon'),
    coordinates: z
      .array(z.array(z.tuple([z.number(), z.number()])))
      .min(1, 'At least one ring required')
      .refine((rings) => rings.every(ring => ring.length >= 4), {
        message: 'Each polygon ring must have at least 4 points (including closing point)',
      }),
  }),
});

type AreaFormValues = z.infer<typeof areaSchema>;

export default function AddArea() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'draw' | 'manual'>('draw');

  const [center, setCenter] = useState({ lat: 31.5204, lng: 74.3587 });
  const [polygon, setPolygon] = useState<[number, number][][]>([]);
  const [manualInput, setManualInput] = useState('');

  const form = useForm<AreaFormValues>({
    resolver: zodResolver(areaSchema),
    defaultValues: {
      name: '',
      city: 'Lahore',
      center: { lat: 31.5204, lng: 74.3587 },
      polygon: { type: 'Polygon', coordinates: [] },
    },
  });

  // Parse manual input: lat, lng per line → [lng, lat] for MongoDB
  const parseManualPoints = () => {
    try {
      const lines = manualInput.trim().split('\n').filter(line => line.trim());
      if (lines.length < 3) throw new Error('Need at least 3 points to form a polygon');

      const coords: [number, number][] = lines.map((line, i) => {
        const parts = line.split(',').map(s => s.trim());
        if (parts.length !== 2) throw new Error(`Invalid format at line ${i + 1}`);

        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);

        if (isNaN(lat) || isNaN(lng)) throw new Error(`Invalid number at line ${i + 1}`);
        if (lat < 23.5 || lat > 37.5 || lng < 60.0 || lng > 78.0) {
          throw new Error(`Point out of Pakistan bounds at line ${i + 1}`);
        }

        return [lng, lat] as [number, number]; // [lng, lat] → MongoDB order
      });

      // Auto-close polygon
      const first = coords[0];
      const last = coords[coords.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        coords.push(first);
      }

      setPolygon([coords]);
      form.setValue('polygon', { type: 'Polygon', coordinates: [coords] });
      toast.success(`Loaded ${coords.length} points (polygon closed)`);
    } catch (err: any) {
      toast.error(err.message || 'Invalid coordinates');
    }
  };

  const onSubmit = async (data: AreaFormValues) => {
    // Final safety check
    if (!polygon.length || polygon[0].length < 4) {
      toast.error('Please draw or load a valid delivery zone polygon');
      return;
    }

    const payload = {
      name: data.name.trim(),
      city: data.city,
      center: { lat: data.center.lat, lng: data.center.lng },
      polygon: { type: 'Polygon', coordinates: polygon },
    };

    try {
      setLoading(true);
await apiClient.post('/admin/area', payload);      toast.success('Delivery area created successfully!');
      navigate('/admin/areas');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to create area';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12">
      <div className="container mx-auto px-6 max-w-7xl">
        <Card className="shadow-2xl border-green-100">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-xl">
            <CardTitle className="text-4xl font-extrabold">Add New Delivery Area</CardTitle>
            <p className="text-green-100 mt-2 text-lg">Draw or paste coordinates to define delivery zone</p>
          </CardHeader>

          <CardContent className="pt-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              {/* Name & City */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Label className="text-lg font-medium">Area Name</Label>
                  <Input
                    placeholder="e.g. DHA Phase 8"
                    className="mt-2 h-12 text-lg"
                    {...form.register('name')}
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-lg font-medium">City</Label>
                  <Select
                    value={form.watch('city')}
                    onValueChange={(v) => form.setValue('city', v as City)}
                  >
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Zone Definition */}
              <div>
                <Label className="text-lg font-medium">Define Delivery Zone</Label>
                <Tabs value={mode} onValueChange={(v) => setMode(v as 'draw' | 'manual')} className="mt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="draw">
                      Draw on Map (Recommended)
                    </TabsTrigger>
                    <TabsTrigger value="manual">
                      Paste Coordinates
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="draw" className="mt-6 border rounded-xl p-4 bg-gray-50">
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
                    <div className="bg-amber-50 border border-amber-300 rounded-xl p-5">
                      <p className="text-sm font-medium text-amber-900 mb-3">
                        Format: <code className="bg-amber-100 px-2 py-1 rounded">latitude, longitude</code> per line
                      </p>
                      <pre className="text-xs bg-amber-100 p-3 rounded font-mono text-amber-800">
                        31.520400, 74.358700<br />
                        31.530000, 74.370000<br />
                        31.510000, 74.380000<br />
                        31.500000, 74.360000
                      </pre>
                      <p className="text-xs text-amber-700 mt-2">
                        Polygon will be auto-closed. Coordinates must be within Pakistan.
                      </p>
                    </div>

                    <Textarea
                      placeholder="Paste coordinates here (one per line: lat, lng)"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      className="font-mono text-sm h-64 resize-none"
                    />

                    <Button
                      type="button"
                      onClick={parseManualPoints}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Load Coordinates to Map
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Live Stats */}
              <div className="flex justify-between items-center bg-gray-50 rounded-xl p-6 border">
                <div className="text-sm space-y-1">
                  <div><strong>Center:</strong> {center.lat.toFixed(6)}, {center.lng.toFixed(6)}</div>
                  <div><strong>Points:</strong> {polygon[0]?.length || 0} (min 4)</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {polygon[0]?.length || 0} points
                  </Badge>
                  {polygon.length > 0 && polygon[0].length >= 4 ? (
                    <Badge variant="default" className="bg-green-600 text-white">
                      Valid Polygon
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      Invalid
                    </Badge>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-4 pt-8 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/admin/areas')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-12"
                  disabled={loading || !polygon.length || polygon[0].length < 4}
                >
                  {loading ? 'Creating Area...' : 'Create Delivery Area'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}