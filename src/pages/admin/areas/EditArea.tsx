// src/pages/admin/areas/EditArea.tsx
// Modernized & production-ready - December 31, 2025
// Consistent style with AddArea & AreasList - Better readability & UX

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Switch } from '@/components/ui/switch';
import { Loader2, MapPin, AlertCircle, Edit, Truck } from 'lucide-react';

import { apiClient } from '@/lib/api';
import AreaMapDrawer from '@/components/admin/AreaMapDrawer';
import type { Map as LeafletMap } from 'leaflet';

// ── Constants & Schema ─────────────────────────────────────────────────
const CITIES = ['Rawalpindi', 'Islamabad', 'Lahore', 'Karachi'] as const;
type City = typeof CITIES[number];

const PAKISTAN_BOUNDS = {
  lat: { min: 23.5, max: 37.5 },
  lng: { min: 60.0, max: 78.0 },
};

const deliveryZoneSchema = z.object({
  minOrderAmount: z.number().min(0, 'Must be ≥ 0'),
  deliveryFee: z.number().min(0).optional(),
  freeDeliveryAbove: z.number().min(0).optional(),
  baseFee: z.number().min(0).optional(),
  distanceFeePerKm: z.number().min(0).optional(),
  maxDistanceKm: z.number().min(0).optional(),
  isActive: z.boolean(),
});

const areaSchema = z.object({
  name: z.string().min(2, 'Name too short').max(50, 'Name too long'),
  city: z.enum(CITIES),
  center: z.object({
    lat: z.number().min(PAKISTAN_BOUNDS.lat.min).max(PAKISTAN_BOUNDS.lat.max),
    lng: z.number().min(PAKISTAN_BOUNDS.lng.min).max(PAKISTAN_BOUNDS.lng.max),
  }),
  deliveryZone: deliveryZoneSchema.optional(),
});

type AreaFormValues = z.infer<typeof areaSchema>;

// ── Component ──────────────────────────────────────────────────────────
export default function EditArea() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      deliveryZone: {
        minOrderAmount: 0,
        isActive: false,
      },
    },
  });

  // Watch delivery zone for preview
  const deliveryZone = form.watch('deliveryZone');
  const estimatedMaxFee = useMemo(() => {
    if (!deliveryZone?.baseFee || !deliveryZone?.distanceFeePerKm || !deliveryZone?.maxDistanceKm) {
      return 0;
    }
    return deliveryZone.baseFee + deliveryZone.distanceFeePerKm * deliveryZone.maxDistanceKm;
  }, [deliveryZone]);

  // ── Load existing area ─────────────────────────────────────────────────
  useEffect(() => {
    if (!id) {
      toast.error('Invalid area ID');
      navigate('/admin/areas');
      return;
    }

    const loadArea = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/admin/area/${id}`);
        const { area, deliveryZone } = res as any;

        if (!area?._id) throw new Error('Area not found');

        form.reset({
          name: area.name,
          city: area.city as City,
          center: area.centerLatLng,
          deliveryZone: deliveryZone || undefined,
        });

        setCenter(area.centerLatLng);
        const loadedPolygon = area.polygonLatLng?.map((ring: [number, number][]) => [...ring]) || [];
        setPolygon(loadedPolygon);

        // Populate manual input
        if (loadedPolygon.length > 0) {
          const flat = loadedPolygon
            .flat()
            .map(([lat, lng]) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
            .join('\n');
          setManualInput(flat);
        }

        toast.success('Area loaded');
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load area');
        navigate('/admin/areas');
      } finally {
        setLoading(false);
      }
    };

    loadArea();
  }, [id, navigate, form]);

  // ── Manual coordinate parser ───────────────────────────────────────────
  const parseManualPoints = () => {
    setManualLoading(true);
    try {
      const lines = manualInput.trim().split('\n').filter(Boolean);
      if (lines.length < 3) throw new Error('Minimum 3 points required');

      const points: [number, number][] = lines.map((line, i) => {
        const [latStr, lngStr] = line.split(',').map(s => s.trim());
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);
        if (isNaN(lat) || isNaN(lng)) throw new Error(`Invalid number at line ${i + 1}`);
        if (
          lat < PAKISTAN_BOUNDS.lat.min ||
          lat > PAKISTAN_BOUNDS.lat.max ||
          lng < PAKISTAN_BOUNDS.lng.min ||
          lng > PAKISTAN_BOUNDS.lng.max
        ) {
          throw new Error(`Coordinates out of Pakistan bounds (line ${i + 1})`);
        }
        return [lat, lng];
      });

      // Close polygon if needed
      const first = points[0];
      const last = points[points.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) points.push(first);

      const newPolygon = [points];
      setPolygon(newPolygon);

      // Update center
      const avgLat = points.reduce((sum, [lat]) => sum + lat, 0) / points.length;
      const avgLng = points.reduce((sum, [, lng]) => sum + lng, 0) / points.length;
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

  // ── Submit handler ─────────────────────────────────────────────────────
  const onSubmit = async (data: AreaFormValues) => {
    if (polygon.length === 0 || polygon[0]?.length < 4) {
      toast.error('Valid polygon required (min 3 points + closing point)');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: data.name.trim(),
        city: data.city,
        center: data.center,
        polygon: {
          type: 'Polygon',
          coordinates: polygon.map(ring => ring.map(([lat, lng]) => [lng, lat])),
        },
        deliveryZone: data.deliveryZone,
      };

      await apiClient.put(`/admin/area/${id}`, payload);
      toast.success('Area updated successfully');
      navigate('/admin/areas');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Resize map on tab change
  useEffect(() => {
    if (mode === 'draw' && mapRef.current) {
      const timer = setTimeout(() => mapRef.current?.invalidateSize(), 200);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  const pointCount = polygon[0]?.length ? polygon[0].length - 1 : 0;
  const isPolygonValid = polygon.length > 0 && polygon[0]?.length >= 4;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-14 w-14 animate-spin text-amber-600 mx-auto" />
          <p className="text-xl font-medium text-gray-700">Loading area details...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-16 pt-8 md:pt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Card className="border shadow-xl bg-white overflow-hidden">
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-amber-700 to-amber-600 text-white pb-10 pt-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="rounded-full bg-white/20 p-4">
                <Edit className="w-12 h-12 md:w-16 md:h-16" />
              </div>
              <div>
                <CardTitle className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  Edit Delivery Area
                </CardTitle>
                <p className="text-amber-100 mt-2 text-lg">
                  Update zone boundaries and delivery settings
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-10 pb-16 px-6 md:px-10">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-14">
              {/* 1. Basic Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-gray-800">
                    Area Name <span className="text-amber-700">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. Bahria Town Phase 8"
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
                  <Select value={form.watch('city')} onValueChange={v => form.setValue('city', v as City)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map(city => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 2. Polygon */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-100 p-2">
                    <MapPin className="h-8 w-8 text-amber-700" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Delivery Zone Polygon</h2>
                </div>

                <Tabs value={mode} onValueChange={v => setMode(v as 'draw' | 'manual')} className="space-y-6">
                  <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="draw">Draw / Edit on Map</TabsTrigger>
                    <TabsTrigger value="manual">Paste Coordinates</TabsTrigger>
                  </TabsList>

                  <TabsContent value="draw" className="mt-2">
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

                  <TabsContent value="manual" className="mt-2 space-y-6">
                    <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-6">
                      <h4 className="font-semibold text-amber-800 mb-3">Format:</h4>
                      <pre className="bg-white p-4 rounded-lg font-mono text-sm text-gray-700 overflow-x-auto">
                        33.565100, 73.016900<br />
                        33.575000, 73.026900<br />
                        33.575000, 73.006900<br />
                        33.565100, 73.016900 ← auto-closes
                      </pre>
                    </div>

                    <Textarea
                      placeholder="Paste coordinates here (one per line)..."
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
                      ) : (
                        'Load & Preview'
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>

              {/* 3. Delivery Zone Settings */}
              <div className="rounded-2xl border bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="rounded-lg bg-amber-100 p-2">
                    <Truck className="h-8 w-8 text-amber-700" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Delivery Settings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-base font-medium text-gray-800">Min. Order Amount (Rs.)</Label>
                    <Input
                      type="number"
                      {...form.register('deliveryZone.minOrderAmount', { valueAsNumber: true })}
                      className="mt-2 h-11"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-medium text-gray-800">Free Delivery Above (Rs.)</Label>
                    <Input
                      type="number"
                      {...form.register('deliveryZone.freeDeliveryAbove', { valueAsNumber: true })}
                      className="mt-2 h-11"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-3 mt-4">
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                      <div>
                        <Label className="text-base font-medium text-gray-800">Delivery Active</Label>
                        <p className="text-sm text-gray-500 mt-1">
                          Enable/disable delivery for this zone
                        </p>
                      </div>
                      <Controller
                        control={form.control}
                        name="deliveryZone.isActive"
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!isPolygonValid}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Fee Preview */}
                {deliveryZone?.baseFee && deliveryZone?.distanceFeePerKm && deliveryZone?.maxDistanceKm ? (
                  <div className="mt-8 p-5 bg-amber-50/60 rounded-xl border border-amber-100">
                    <h4 className="font-semibold text-amber-800 mb-2">Max Distance Fee Preview</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-amber-700">
                        Rs. {estimatedMaxFee.toFixed(0)}
                      </span>
                      <span className="text-sm text-gray-600">
                        (Base + {deliveryZone.distanceFeePerKm} × {deliveryZone.maxDistanceKm} km)
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Summary & Actions */}
              <div className="space-y-8">
                {/* Summary */}
                <div className="bg-gray-50/70 border rounded-xl p-6">
                  <h3 className="font-bold text-xl text-gray-800 mb-5">Current Status</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                    <div>
                      <p className="text-gray-600">Center Coordinates</p>
                      <p className="font-mono mt-1 text-gray-800">
                        {center.lat.toFixed(6)}, {center.lng.toFixed(6)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Polygon Points</p>
                      <p className="text-2xl font-bold text-amber-700 mt-1">{pointCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Polygon Status</p>
                      {isPolygonValid ? (
                        <Badge className="mt-1 text-base bg-green-600 hover:bg-green-600">
                          Valid & Ready
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="mt-1 text-base">
                          Needs attention
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6">
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
                    disabled={saving || !isPolygonValid}
                    className="bg-amber-700 hover:bg-amber-800 min-w-[220px]"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}