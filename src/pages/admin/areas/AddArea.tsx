// src/pages/admin/areas/AddArea.tsx
// Fixed payload key: mongoPolygon → polygon — January 1, 2026

import { useState, useEffect, useRef, useMemo } from 'react';
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
import { Loader2, MapPin, AlertCircle } from 'lucide-react';

import { apiClient } from '@/lib/api';
import AreaMapDrawer from '@/components/admin/AreaMapDrawer';
import type { Map as LeafletMap } from 'leaflet';

// Response type for area creation
interface AreaCreationResponse {
  success: boolean;
  message: string;
  area: {
    _id: string;
    name: string;
    city: string;
    // ... other fields
  };
}

// ── Schema & Types ─────────────────────────────────────────────────────
const CITIES = ['Rawalpindi', 'Islamabad', 'Lahore', 'Karachi'] as const;
type City = typeof CITIES[number];

const PAKISTAN_BOUNDS = {
  lat: { min: 23.5, max: 37.5 },
  lng: { min: 60.0, max: 78.0 },
};

const areaSchema = z.object({
  name: z.string().min(2, 'Area name is too short').max(50, 'Area name is too long'),
  city: z.enum(CITIES),
  center: z.object({
    lat: z.number().min(PAKISTAN_BOUNDS.lat.min).max(PAKISTAN_BOUNDS.lat.max),
    lng: z.number().min(PAKISTAN_BOUNDS.lng.min).max(PAKISTAN_BOUNDS.lng.max),
  }),
});

type AreaFormValues = z.infer<typeof areaSchema>;

// ── Component ──────────────────────────────────────────────────────────
export default function AddArea() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [mode, setMode] = useState<'draw' | 'manual'>('draw');

  const [center, setCenter] = useState({ lat: 33.5651, lng: 73.0169 });
  const [polygon, setPolygon] = useState<[number, number][][]>([]);
  const [manualInput, setManualInput] = useState('');

  const mapRef = useRef<LeafletMap | null>(null);

  const form = useForm<AreaFormValues>({
    resolver: zodResolver(areaSchema),
    defaultValues: {
      name: '',
      city: 'Rawalpindi',
      center,
    },
  });

  // ── Handlers ───────────────────────────────────────────────────────────
  const parseManualPoints = async () => {
    setManualLoading(true);
    try {
      const lines = manualInput.trim().split('\n').filter(Boolean);
      if (lines.length < 3) throw new Error('Minimum 3 points required');

      const points: [number, number][] = lines.map((line, i) => {
        const [latStr, lngStr] = line.split(',').map(s => s.trim());
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);
        if (isNaN(lat) || isNaN(lng)) throw new Error(`Invalid at line ${i + 1}`);
        if (
          lat < PAKISTAN_BOUNDS.lat.min ||
          lat > PAKISTAN_BOUNDS.lat.max ||
          lng < PAKISTAN_BOUNDS.lng.min ||
          lng > PAKISTAN_BOUNDS.lng.max
        ) {
          throw new Error(`Out of bounds at line ${i + 1}`);
        }
        return [lat, lng];
      });

      // Auto-close polygon
      const first = points[0];
      const last = points[points.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        points.push(first);
      }

      setPolygon([points]);

      const avgLat = points.reduce((s, [lat]) => s + lat, 0) / points.length;
      const avgLng = points.reduce((s, [, lng]) => s + lng, 0) / points.length;
      const newCenter = { lat: avgLat, lng: avgLng };
      setCenter(newCenter);
      form.setValue('center', newCenter);

      toast.success(`Loaded ${points.length - 1} points`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to parse coordinates');
    } finally {
      setManualLoading(false);
    }
  };

  const onSubmit = async (data: AreaFormValues) => {
    if (polygon.length === 0 || polygon[0]?.length < 4) {
      toast.error('Valid polygon required (min 3 points + closing)');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: data.name.trim(),
        city: data.city,
        center: data.center,
        polygon: {  // ← FIXED: Changed from mongoPolygon → polygon
          type: 'Polygon',
          coordinates: polygon.map(ring => ring.map(([lat, lng]) => [lng, lat])),
        },
      };

      // Optional: Debug what is being sent
      // console.log('Sending payload:', JSON.stringify(payload, null, 2));

      const res = await apiClient.post<AreaCreationResponse>('/admin/area', payload);

      if (!res.success || !res.area?._id) {
        throw new Error('Area created but response invalid');
      }

      toast.success(`Area "${data.name}" created successfully!`);
      navigate('/admin/areas');
    } catch (err: any) {
      // Show exact backend validation message if available
      const errorMessage = err?.response?.data?.message || 'Failed to create area';
      toast.error(errorMessage);
      console.error('Create area error:', err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'draw' && mapRef.current) {
      setTimeout(() => mapRef.current?.invalidateSize(), 200);
    }
  }, [mode]);

  const pointCount = useMemo(() => (polygon[0]?.length ?? 0) - 1, [polygon]);
  const isPolygonValid = useMemo(() => polygon.length > 0 && polygon[0]?.length >= 4, [polygon]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-16 pt-8 md:pt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Card className="border shadow-xl bg-white overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-700 to-amber-600 text-white pb-10 pt-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="rounded-full bg-white/20 p-4">
                <MapPin className="w-12 h-12 md:w-16 md:h-16" />
              </div>
              <div>
                <CardTitle className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  Create New Area
                </CardTitle>
                <p className="text-amber-100 mt-2 text-lg">
                  Define the geographical boundaries
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-10 pb-16 px-6 md:px-10">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-14">
              {/* Basic Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-gray-800">
                    Area Name <span className="text-amber-700">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. Bahria Town Phase 8, Saddar"
                    className="h-12 text-base"
                    {...form.register('name')}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-600 flex items-center gap-1.5 mt-1">
                      <AlertCircle className="h-4 w-4" />
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-gray-800">City</Label>
                  <Select
                    value={form.watch('city')}
                    onValueChange={v => form.setValue('city', v as City)}
                  >
                    <SelectTrigger className="h-12">
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

              {/* Polygon */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-100 p-2">
                    <MapPin className="h-8 w-8 text-amber-700" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Area Boundary</h2>
                </div>

                <Tabs value={mode} onValueChange={v => setMode(v as 'draw' | 'manual')} className="space-y-6">
                  <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="draw">Draw on Map</TabsTrigger>
                    <TabsTrigger value="manual">Paste Coordinates</TabsTrigger>
                  </TabsList>

                  <TabsContent value="draw">
                    <div className="rounded-xl border-2 border-amber-200 overflow-hidden shadow-lg bg-gray-50 aspect-[4/3] md:aspect-[3/2]">
                      <AreaMapDrawer
                        ref={mapRef}
                        center={center}
                        polygon={polygon}
                        onCenterChange={c => {
                          setCenter(c);
                          form.setValue('center', c);
                        }}
                        onPolygonChange={setPolygon}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="manual" className="space-y-6">
                    <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-6">
                      <h4 className="font-semibold text-amber-800 mb-3">Format (lat,lng one per line):</h4>
                      <pre className="bg-white p-4 rounded font-mono text-sm text-gray-700 overflow-x-auto">
                        33.565100, 73.016900<br />
                        33.575000, 73.026900<br />
                        33.575000, 73.006900<br />
                        33.565100, 73.016900 ← closes automatically
                      </pre>
                    </div>

                    <Textarea
                      placeholder="Paste coordinates here..."
                      value={manualInput}
                      onChange={e => setManualInput(e.target.value)}
                      className="min-h-[220px] font-mono text-sm"
                      spellCheck={false}
                    />

                    <Button
                      type="button"
                      onClick={parseManualPoints}
                      disabled={manualLoading || !manualInput.trim()}
                      className="w-full md:w-auto bg-amber-600 hover:bg-amber-700"
                    >
                      {manualLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : 'Load & Preview'}
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Summary */}
              <div className="bg-gray-50/70 border rounded-xl p-6 space-y-4">
                <h3 className="font-bold text-xl text-gray-800">Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                  <div>
                    <p className="text-gray-600">Center</p>
                    <p className="font-mono mt-1">
                      {center.lat.toFixed(6)}, {center.lng.toFixed(6)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Points</p>
                    <p className="text-2xl font-bold text-amber-700">{pointCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    {isPolygonValid ? (
                      <Badge className="mt-1 bg-green-600">Valid</Badge>
                    ) : (
                      <Badge variant="secondary" className="mt-1">Incomplete</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6">
                <Button type="button" variant="outline" size="lg" onClick={() => navigate('/admin/areas')}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading || !isPolygonValid}
                  className="bg-amber-700 hover:bg-amber-800 min-w-[220px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : 'Create Area'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}