// src/pages/admin/areas/AreasList.tsx
// PRODUCTION-READY – December 31, 2025
// Fixed endpoint + strong typing

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  MapPin,
  Truck,
  Edit,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

import { apiClient } from '@/lib/api';
import type { AreaListItem, AreaListResponse } from '@/types/area';

/* ------------------------------------------------------------------
   Tiny response type for the toggle-delivery endpoint
------------------------------------------------------------------- */
interface ToggleDeliveryResponse {
  deliveryZone: {
    isActive: boolean;
    // other fields are not needed for the UI
  };
}

export default function AreasList() {
  const [areas, setAreas] = useState<AreaListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  /* ------------------------------------------------------------------
     FETCH AREAS
  ------------------------------------------------------------------- */
  const fetchAreas = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<AreaListResponse>('/admin/areas?limit=1000');
      setAreas(res.areas ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to load delivery areas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  /* ------------------------------------------------------------------
     TOGGLE AREA VISIBILITY
  ------------------------------------------------------------------- */
  const handleToggleVisibility = async (area: AreaListItem) => {
    const areaId = area._id;
    setActionLoading(areaId);

    try {
      await apiClient.patch(`/admin/area/${areaId}/toggle-active`);
      const newActive = !area.isActive;
      toast.success(newActive ? 'Area is now visible' : 'Area is now hidden');

      setAreas((prev) =>
        prev.map((a) => (a._id === areaId ? { ...a, isActive: newActive } : a))
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to update visibility');
    } finally {
      setActionLoading(null);
    }
  };

  /* ------------------------------------------------------------------
     TOGGLE DELIVERY ZONE
  ------------------------------------------------------------------- */
const handleToggleDelivery = async (area: AreaListItem) => {
  if (!area.deliveryZone) return;

  const areaId = area._id;
  setActionLoading(areaId);

  try {
    // CORRECT ENDPOINT – matches backend router
    const res = await apiClient.patch<ToggleDeliveryResponse>(
      `/admin/delivery-zone/${areaId}/toggle`
    );

    const newDeliveryActive = res.deliveryZone.isActive;

    toast.success(
      newDeliveryActive
        ? `Delivery activated for ${area.name}`
        : `Delivery paused for ${area.name}`
    );

    setAreas((prev) =>
      prev.map((a) =>
        a._id === areaId
          ? {
              ...a,
              deliveryZone: {
                ...a.deliveryZone!,
                isActive: newDeliveryActive,
              },
            }
          : a
      )
    );
  } catch (err: any) {
    console.error('Toggle delivery error:', err);
    toast.error(
      err?.response?.data?.message ||
        err.message ||
        'Failed to toggle delivery status'
    );
  } finally {
    setActionLoading(null);
  }
};
  /* ------------------------------------------------------------------
     DELETE AREA
  ------------------------------------------------------------------- */
  const handleDelete = async (areaId: string) => {
    setActionLoading(areaId);
    try {
      await apiClient.delete(`/admin/areas/${areaId}`);
      toast.success('Area deleted permanently');
      setAreas((prev) => prev.filter((a) => a._id !== areaId));
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to delete area');
    } finally {
      setActionLoading(null);
    }
  };

  /* ------------------------------------------------------------------
     RENDER LOADING
  ------------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-14 w-14 animate-spin text-amber-600 mx-auto" />
          <p className="text-xl font-medium text-gray-700">Loading delivery areas...</p>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------
     STAT COUNTERS
  ------------------------------------------------------------------- */
  const liveCount = areas.filter((a) => a.deliveryZone?.isActive).length;
  const pausedCount = areas.filter((a) => a.deliveryZone && !a.deliveryZone.isActive).length;
  const noZoneCount = areas.filter((a) => !a.deliveryZone).length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-16 pt-8 md:pt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 flex items-center gap-4">
              <div className="rounded-xl bg-amber-100 p-3">
                <MapPin className="h-12 w-12 md:h-14 md:w-14 text-amber-700" />
              </div>
              Delivery Areas
            </h1>

            <div className="flex flex-wrap gap-x-8 gap-y-3 text-base md:text-lg">
              <span className="font-medium text-gray-700">{areas.length} Areas</span>
              <span className="flex items-center gap-2 font-semibold text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                {liveCount} Live
              </span>
              <span className="flex items-center gap-2 font-semibold text-amber-700">
                <AlertCircle className="h-5 w-5" />
                {pausedCount} Paused
              </span>
              <span className="flex items-center gap-2 text-gray-500">
                <XCircle className="h-5 w-5" />
                {noZoneCount} No Zone
              </span>
            </div>
          </div>

          <Button asChild size="lg" className="h-12 md:h-14 px-8 bg-amber-700 hover:bg-amber-800">
            <Link to="/admin/areas/add">
              <Plus className="mr-2 h-6 w-6" />
              Add New Area
            </Link>
          </Button>
        </header>

        {/* Empty State */}
        {areas.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed border-gray-300 bg-white/60">
            <MapPin className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">No Delivery Areas Yet</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              Create your first delivery zone to start serving customers
            </p>
            <Button asChild size="lg" className="bg-amber-700 hover:bg-amber-800">
              <Link to="/admin/areas/add">
                <Plus className="mr-2 h-6 w-6" />
                Create First Area
              </Link>
            </Button>
          </Card>
        ) : (
          /* Areas List */
          <div className="space-y-6 lg:space-y-8">
            {areas.map((area) => {
              const hasZone = !!area.deliveryZone;
              const isDeliveryActive = hasZone && area.deliveryZone?.isActive;
              const isAreaActive = area.isActive;
              const isActionLoading = actionLoading === area._id;

              return (
                <Card
                  key={area._id}
                  className={`
                    border overflow-hidden transition-all duration-200
                    ${isDeliveryActive
                      ? 'border-green-300/80 bg-green-50/40 hover:bg-green-50/60'
                      : hasZone
                        ? 'border-amber-300/70 bg-amber-50/30 hover:bg-amber-50/50'
                        : 'border-gray-200 bg-white hover:shadow-md'}
                  `}
                >
                  <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row gap-8 lg:items-start justify-between">
                      {/* Left – Info */}
                      <div className="flex-1 space-y-6">
                        <div className="flex items-start gap-5">
                          <div className={`p-4 rounded-xl ${isDeliveryActive ? 'bg-green-600' : 'bg-amber-700'}`}>
                            <MapPin className="h-10 w-10 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{area.name}</h3>
                            <p className="text-lg text-gray-600 mt-1">{area.city}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Badge
                            variant={isAreaActive ? 'default' : 'secondary'}
                            className={isAreaActive ? 'bg-green-600 hover:bg-green-600' : ''}
                          >
                            {isAreaActive ? 'Visible' : 'Hidden'}
                          </Badge>

                          {hasZone ? (
                            <>
                              <Badge
                                variant={isDeliveryActive ? 'default' : 'outline'}
                                className={
                                  isDeliveryActive
                                    ? 'bg-green-600 text-white hover:bg-green-600'
                                    : 'border-amber-600 text-amber-700'
                                }
                              >
                                {isDeliveryActive ? 'Delivery LIVE' : 'Paused'}
                              </Badge>

                              {area.deliveryZone?.freeDeliveryAbove != null &&
                                area.deliveryZone.freeDeliveryAbove > 0 && (
                                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                                    Free ≥ Rs.{area.deliveryZone.freeDeliveryAbove.toLocaleString()}
                                  </Badge>
                                )}
                            </>
                          ) : (
                            <Badge variant="outline" className="border-red-400 text-red-700 flex items-center gap-1.5">
                              <AlertCircle className="h-4 w-4" />
                              No Delivery Zone
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Right – Controls */}
                      <div className="min-w-[300px] lg:min-w-[340px] flex flex-col gap-5">
                        {/* Visibility Toggle */}
                        <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
                          <span className="font-semibold text-gray-800">Area Visibility</span>
                          <div className="flex items-center gap-3">
                            {isActionLoading && <Loader2 className="h-5 w-5 animate-spin text-amber-600" />}
                            <Switch
                              checked={isAreaActive}
                              onCheckedChange={() => handleToggleVisibility(area)}
                              disabled={isActionLoading}
                            />
                            <span className={`font-bold ${isAreaActive ? 'text-green-700' : 'text-gray-500'}`}>
                              {isAreaActive ? 'ON' : 'OFF'}
                            </span>
                          </div>
                        </div>

                        <Separator className="my-2" />

                        {/* Delivery Control */}
                        <Button
                          size="lg"
                          variant={isDeliveryActive ? 'destructive' : 'default'}
                          disabled={isActionLoading || !isAreaActive || !hasZone}
                          onClick={() => handleToggleDelivery(area)}
                          className={`h-14 text-base md:text-lg font-medium w-full ${
                            isDeliveryActive ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-700 hover:bg-amber-800'
                          }`}
                        >
                          {isActionLoading ? (
                            <>
                              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                              Updating...
                            </>
                          ) : isDeliveryActive ? (
                            <>
                              <XCircle className="mr-2 h-5 w-5" />
                              Pause Delivery
                            </>
                          ) : (
                            <>
                              <Truck className="mr-2 h-5 w-5" />
                              Start Delivery
                            </>
                          )}
                        </Button>

                        {/* Edit + Delete */}
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="border-amber-300 hover:bg-amber-50 h-12"
                          >
                            <Link to={`/admin/areas/edit/${area._id}`}>
                              <Edit className="mr-2 h-5 w-5" />
                              Edit
                            </Link>
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="lg"
                                className="border-red-300 text-red-700 hover:bg-red-50 h-12"
                              >
                                <Trash2 className="mr-2 h-5 w-5" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete {area.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. The area and its delivery zone will be
                                  permanently removed.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(area._id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Permanently
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}