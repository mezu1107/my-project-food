// src/pages/admin/areas/AddArea.tsx
// Improved version - Better contrast & readability - January 2026

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
import { Loader2, MapPin, AlertCircle, Truck } from 'lucide-react';

import { apiClient } from '@/lib/api';
import AreaMapDrawer from '@/components/admin/AreaMapDrawer';
import type { Map as LeafletMap } from 'leaflet';

// ── Types & Schema ─────────────────────────────────────────────────────
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

interface DeliveryZonePayload {
  feeStructure: 'flat' | 'distance';
  deliveryFee?: number;
  baseFee?: number;
  distanceFeePerKm?: number;
  maxDistanceKm?: number;
  minOrderAmount: number;
  estimatedTime: string;
  freeDeliveryAbove?: number;
  isActive: boolean;
}

// ── Component ──────────────────────────────────────────────────────────
export default function AddArea() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [mode, setMode] = useState<'draw' | 'manual'>('draw');

  const [center, setCenter] = useState({ lat: 33.5651, lng: 73.0169 });
  const [polygon, setPolygon] = useState<[number, number][][]>([]);
  const [manualInput, setManualInput] = useState('');

  // Delivery settings
  const [feeStructure, setFeeStructure] = useState<'flat' | 'distance'>('flat');
  const [flatFee, setFlatFee] = useState('149');
  const [baseFee, setBaseFee] = useState('99');
  const [feePerKm, setFeePerKm] = useState('25');
  const [maxDistance, setMaxDistance] = useState('15');
  const [minOrder, setMinOrder] = useState('0');
  const [estimatedTime, setEstimatedTime] = useState('35-50 min');
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState('0');

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
      if (lines.length < 3) throw new Error('Minimum 3 points required for a polygon');

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
          throw new Error(`Coordinates at line ${i + 1} outside Pakistan bounds`);
        }
        return [lat, lng];
      });

      // Close polygon if needed
      const first = points[0];
      const last = points[points.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        points.push(first);
      }

      setPolygon([points]);

      // Calculate center
      const avgLat = points.reduce((sum, [lat]) => sum + lat, 0) / points.length;
      const avgLng = points.reduce((sum, [, lng]) => sum + lng, 0) / points.length;
      const newCenter = { lat: avgLat, lng: avgLng };
      setCenter(newCenter);
      form.setValue('center', newCenter);

      toast.success(`Successfully loaded ${points.length - 1} points`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to parse coordinates');
    } finally {
      setManualLoading(false);
    }
  };

  const onSubmit = async (data: AreaFormValues) => {
    if (polygon.length === 0 || polygon[0].length < 4) {
      toast.error('Please draw or paste a valid polygon (min 3 points + closing)');
      return;
    }

    setLoading(true);

    try {
      const areaPayload = {
        name: data.name.trim(),
        city: data.city,
        center: data.center,
        mongoPolygon: {
          type: 'Polygon',
          coordinates: polygon.map(ring => ring.map(([lat, lng]) => [lng, lat])),
        },
      };

      const areaRes = await apiClient.post('/admin/areas', areaPayload);
      const createdArea = (areaRes as any).area;
      if (!createdArea?._id) throw new Error('Area creation failed - no ID');

      const zonePayload: DeliveryZonePayload = {
        feeStructure,
        minOrderAmount: Number(minOrder),
        estimatedTime: estimatedTime.trim(),
        isActive: true,
        freeDeliveryAbove: Number(freeDeliveryAbove) || undefined,
      };

      if (feeStructure === 'flat') {
        zonePayload.deliveryFee = Number(flatFee);
      } else {
        zonePayload.baseFee = Number(baseFee);
        zonePayload.distanceFeePerKm = Number(feePerKm);
        zonePayload.maxDistanceKm = Number(maxDistance);
        zonePayload.deliveryFee = 0;
      }

      await apiClient.put(`/admin/areas/${createdArea._id}/delivery-zone`, zonePayload);

      toast.success(`Area "${data.name}" and delivery zone created!`);
      navigate('/admin/areas');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to create area/delivery zone';
      toast.error(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Resize map when switching tabs
  useEffect(() => {
    if (mode === 'draw' && mapRef.current) {
      const timer = setTimeout(() => mapRef.current?.invalidateSize(), 200);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  const pointCount = useMemo(() => (polygon[0]?.length ? polygon[0].length - 1 : 0), [polygon]);
  const isPolygonValid = useMemo(() => polygon.length > 0 && polygon[0]?.length >= 4, [polygon]);

  const previewFreeDelivery = useMemo(() => {
    const free = Number(freeDeliveryAbove);
    return free > 0 ? `Free delivery for orders ≥ Rs.${free}` : 'No free delivery threshold';
  }, [freeDeliveryAbove]);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-16 pt-8 md:pt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Card className="border shadow-xl bg-white overflow-hidden">
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-amber-700 to-amber-600 text-white pb-10 pt-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="rounded-full bg-white/20 p-4">
                <MapPin className="w-12 h-12 md:w-16 md:h-16" />
              </div>
              <div>
                <CardTitle className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  Create New Delivery Area
                </CardTitle>
                <p className="text-amber-100 mt-2 text-lg">
                  Draw your zone and configure delivery pricing
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
                    <TabsTrigger value="draw">Draw on Map</TabsTrigger>
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
                      <h4 className="font-semibold text-amber-800 mb-3">Expected format:</h4>
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

              {/* 3. Delivery Settings */}
              <div className="rounded-2xl border bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="rounded-lg bg-amber-100 p-2">
                    <Truck className="h-8 w-8 text-amber-700" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Delivery Settings</h2>
                </div>

                <div className="space-y-10">
                  {/* Pricing model + values */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <Label className="text-base font-medium text-gray-800">Pricing Model</Label>
                      <Select value={feeStructure} onValueChange={v => setFeeStructure(v as 'flat' | 'distance')}>
                        <SelectTrigger className="mt-2 h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flat">Flat Fee</SelectItem>
                          <SelectItem value="distance">Distance-Based</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {feeStructure === 'flat' ? (
                      <div>
                        <Label className="text-base font-medium text-gray-800">Flat Delivery Fee (Rs.)</Label>
                        <Input
                          type="number"
                          value={flatFee}
                          onChange={e => setFlatFee(e.target.value)}
                          min={0}
                          className="mt-2 h-11"
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                          <Label className="text-base font-medium text-gray-800">Base Fee</Label>
                          <Input
                            type="number"
                            value={baseFee}
                            onChange={e => setBaseFee(e.target.value)}
                            min={0}
                            className="mt-2 h-11"
                          />
                        </div>
                        <div>
                          <Label className="text-base font-medium text-gray-800">Fee / km</Label>
                          <Input
                            type="number"
                            value={feePerKm}
                            onChange={e => setFeePerKm(e.target.value)}
                            min={0}
                            className="mt-2 h-11"
                          />
                        </div>
                        <div>
                          <Label className="text-base font-medium text-gray-800">Max Distance (km)</Label>
                          <Input
                            type="number"
                            value={maxDistance}
                            onChange={e => setMaxDistance(e.target.value)}
                            min={1}
                            className="mt-2 h-11"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional rules */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                      <Label className="text-base font-medium text-gray-800">Min. Order Amount (Rs.)</Label>
                      <Input
                        type="number"
                        value={minOrder}
                        onChange={e => setMinOrder(e.target.value)}
                        min={0}
                        className="mt-2 h-11"
                      />
                    </div>

                    <div>
                      <Label className="text-base font-medium text-gray-800">Estimated Time</Label>
                      <Input
                        value={estimatedTime}
                        onChange={e => setEstimatedTime(e.target.value)}
                        placeholder="35-50 min"
                        className="mt-2 h-11"
                      />
                    </div>

                    <div>
                      <Label className="text-base font-medium text-gray-800">Free Above (Rs.)</Label>
                      <Input
                        type="number"
                        value={freeDeliveryAbove}
                        onChange={e => setFreeDeliveryAbove(e.target.value)}
                        min={0}
                        className="mt-2 h-11"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary & Actions */}
              <div className="space-y-8">
                {/* Summary Card */}
                <div className="bg-gray-50/70 border rounded-xl p-6">
                  <h3 className="font-bold text-xl text-gray-800 mb-5">Zone Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                    <div>
                      <p className="text-gray-600">Center</p>
                      <p className="font-mono mt-1 text-gray-800">
                        {center.lat.toFixed(6)}, {center.lng.toFixed(6)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Points</p>
                      <p className="text-2xl font-bold text-amber-700 mt-1">{pointCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Polygon</p>
                      {isPolygonValid ? (
                        <Badge className="mt-1 text-base bg-amber-600 hover:bg-amber-600">
                          Ready
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="mt-1 text-base">
                          Not ready
                        </Badge>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-600">Free Delivery</p>
                      <p className="font-medium mt-1 text-gray-800">{previewFreeDelivery}</p>
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
                    disabled={loading || !isPolygonValid}
                    className="bg-amber-700 hover:bg-amber-800 min-w-[240px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Area + Delivery Zone'
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