// src/pages/admin/areas/AreasList.tsx
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
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Area } from '@/types/area';

export default function AreasList() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<{ success: true; areas: Area[] }>('/admin/areas?limit=500');
      setAreas(res.areas || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load areas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  // Toggle Area Visibility (inService)
  const toggleAreaActive = async (area: Area) => {
    setActionLoading(area._id);
    try {
      await apiClient.patch(`/admin/area/${area._id}/toggle-active`);
      toast.success(area.isActive ? 'Area deactivated' : 'Area activated');
      setAreas(prev =>
        prev.map(a =>
          a._id === area._id ? { ...a, isActive: !a.isActive } : a
        )
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to toggle area');
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle Delivery ON/OFF – FULLY TYPE-SAFE!
  const toggleDeliveryZone = async (area: Area) => {
    setActionLoading(area._id);
    try {
      await apiClient.patch(`/admin/delivery-zone/${area._id}/toggle`);
      const newStatus = !area.deliveryZone?.isActive;

      toast.success(newStatus ? 'Delivery activated' : 'Delivery paused');

      setAreas(prev =>
        prev.map(a =>
          a._id === area._id
            ? {
                ...a,
                deliveryZone: a.deliveryZone
                  ? { ...a.deliveryZone, isActive: newStatus }
                  : {
                      _id: 'new-zone-' + Date.now(),
                      deliveryFee: 149,
                      minOrderAmount: 0,
                      estimatedTime: '35-50 min',
                      isActive: true,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    },
              }
            : a
        )
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to toggle delivery');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteArea = async (areaId: string) => {
    setActionLoading(areaId);
    try {
      await apiClient.delete(`/admin/area/${areaId}`);
      toast.success('Area deleted permanently');
      setAreas(prev => prev.filter(a => a._id !== areaId));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete area');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-green-600 mx-auto" />
          <p className="mt-6 text-xl font-semibold text-green-700">Loading delivery areas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-center gap-4">
              <MapPin className="h-12 w-12" /> Delivery Areas
            </h1>
            <p className="text-xl text-muted-foreground mt-3">
              {areas.length} total • {areas.filter(a => a.deliveryZone?.isActive).length} live •{' '}
              {areas.filter(a => a.deliveryZone && !a.deliveryZone.isActive).length} paused
            </p>
          </div>
          <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
            <Link to="/admin/areas/add">
              <Plus className="mr-2 h-6 w-6" /> Add New Area
            </Link>
          </Button>
        </div>

        {/* Areas Grid */}
        <div className="grid gap-8">
          {areas.map(area => {
            const isLive = area.deliveryZone?.isActive === true;
            const isLoading = actionLoading === area._id;

            return (
              <Card
                key={area._id}
                className={`overflow-hidden transition-all hover:shadow-2xl ${isLive ? 'ring-4 ring-green-500 ring-opacity-30' : ''}`}
              >
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row justify-between gap-8">
                    {/* Left */}
                    <div className="flex-1">
                      <div className="flex items-center gap-5 mb-6">
                        <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                          <MapPin className="h-10 w-10 text-white" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold">{area.name}</h3>
                          <p className="text-lg text-muted-foreground">{area.city}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-4">
                        <Badge variant={area.isActive ? 'default' : 'secondary'}>
                          Area {area.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {area.deliveryZone ? (
                          <Badge variant={isLive ? 'default' : 'destructive'}>
                            Delivery {isLive ? 'LIVE' : 'PAUSED'}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-orange-500 text-orange-600">
                            <AlertCircle className="h-3 w-3 mr-1" /> No Delivery Zone
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Right Controls */}
                    <div className="flex flex-col gap-6 min-w-[320px]">
                      {/* Area Visibility Switch */}
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-lg">Area Visibility</span>
                        <Switch
                          checked={area.isActive}
                          onCheckedChange={() => toggleAreaActive(area)}
                          disabled={isLoading}
                        />
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                        ) : area.isActive ? (
                          <span className="text-green-600 font-medium">ON</span>
                        ) : (
                          <span className="text-gray-400 font-medium">OFF</span>
                        )}
                      </div>

                      <Separator />

                      {/* Delivery Toggle Button */}
                      <Button
                        size="lg"
                        variant={isLive ? 'destructive' : 'default'}
                        onClick={() => toggleDeliveryZone(area)}
                        disabled={isLoading}
                        className="w-full text-lg font-medium"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Truck className="mr-3 h-6 w-6" />
                            {isLive ? 'Pause Delivery' : 'Start Delivery'}
                          </>
                        )}
                      </Button>

                      <div className="flex gap-3">
                        <Button asChild variant="outline" size="lg" className="flex-1">
                          <Link to={`/admin/areas/edit/${area._id}`}>
                            <Edit className="mr-2 h-5 w-5" /> Edit Area
                          </Link>
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="lg">
                              <Trash2 className="mr-2 h-5 w-5" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete {area.name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action <strong>cannot be undone</strong>. The area and delivery zone will be permanently removed.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteArea(area._id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Forever
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

        {/* Empty State */}
        {areas.length === 0 && (
          <Card className="p-20 text-center border-dashed border-2 border-gray-300">
            <MapPin className="h-20 w-20 mx-auto text-muted-foreground opacity-30 mb-6" />
            <h3 className="text-2xl font-bold text-muted-foreground">No delivery areas yet</h3>
            <p className="text-muted-foreground mt-2">Start adding your first delivery zone</p>
            <Button asChild size="lg" className="mt-6 bg-green-600 hover:bg-green-700">
              <Link to="/admin/areas/add">
                <Plus className="mr-2 h-6 w-6" /> Add First Area
              </Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}