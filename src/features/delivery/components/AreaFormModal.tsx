import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, MapPin, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { LeafletMap } from './LeafletMap';
import type { Area, GeoJSONPolygon, CreateAreaPayload } from '../types/delivery.types';
import {
  useCreateAreaMutation,
  useUpdateAreaMutation,
  useDeleteAreaMutation,
  useUpdateDeliveryZoneMutation,
  useAreaDeliveryZoneQuery,
} from '../hooks/useAdminAreasApi';

const areaFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  city: z.string().min(1, 'City is required'),
  deliveryFee: z.coerce.number().min(0, 'Must be 0 or more'),
  minOrderAmount: z.coerce.number().min(0, 'Must be 0 or more'),
  estimatedTime: z.string().min(1, 'Estimated time is required'),
  isDeliveryActive: z.boolean(),
});

type AreaFormData = z.infer<typeof areaFormSchema>;

interface AreaFormModalProps {
  open: boolean;
  onClose: () => void;
  editArea?: Area | null;
}

export const AreaFormModal = ({ open, onClose, editArea }: AreaFormModalProps) => {
  const [polygon, setPolygon] = useState<GeoJSONPolygon | null>(null);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const createMutation = useCreateAreaMutation();
  const updateMutation = useUpdateAreaMutation();
  const deleteMutation = useDeleteAreaMutation();
  const updateZoneMutation = useUpdateDeliveryZoneMutation();
  
  // Fetch delivery zone data when editing
  const { data: existingZone } = useAreaDeliveryZoneQuery(editArea?._id ?? null);

  const isEditing = !!editArea;
  const isLoading = createMutation.isPending || updateMutation.isPending || updateZoneMutation.isPending;

  const form = useForm<AreaFormData>({
    resolver: zodResolver(areaFormSchema),
    defaultValues: {
      name: '',
      city: 'Lahore',
      deliveryFee: 99,
      minOrderAmount: 299,
      estimatedTime: '30-45 min',
      isDeliveryActive: false,
    },
  });

  // Reset form when editArea or existingZone changes
  useEffect(() => {
    if (editArea) {
      form.reset({
        name: editArea.name,
        city: editArea.city.charAt(0) + editArea.city.slice(1).toLowerCase(), // Convert LAHORE to Lahore
        deliveryFee: existingZone?.deliveryFee ?? 99,
        minOrderAmount: existingZone?.minOrderAmount ?? 299,
        estimatedTime: existingZone?.estimatedTime ?? '30-45 min',
        isDeliveryActive: editArea.isActive,
      });
      setPolygon(editArea.polygon);
      if (editArea.center?.coordinates) {
        setCenter({
          lng: editArea.center.coordinates[0],
          lat: editArea.center.coordinates[1],
        });
      }
    } else {
      form.reset({
        name: '',
        city: 'Lahore',
        deliveryFee: 99,
        minOrderAmount: 299,
        estimatedTime: '30-45 min',
        isDeliveryActive: false,
      });
      setPolygon(null);
      setCenter(null);
    }
  }, [editArea, existingZone, form]);

  const handlePolygonDrawn = (newPolygon: GeoJSONPolygon, newCenter: { lat: number; lng: number }) => {
    setPolygon(newPolygon);
    setCenter(newCenter);
  };

  const onSubmit = async (data: AreaFormData) => {
    if (!polygon || !center) {
      form.setError('root', { message: 'Please draw a polygon on the map' });
      return;
    }

    const areaPayload: CreateAreaPayload = {
      name: data.name,
      city: data.city,
      center,
      polygon,
    };

    try {
      if (isEditing && editArea) {
        await updateMutation.mutateAsync({ id: editArea._id, payload: areaPayload });
        if (data.isDeliveryActive) {
          await updateZoneMutation.mutateAsync({
            areaId: editArea._id,
            payload: {
              deliveryFee: data.deliveryFee,
              minOrderAmount: data.minOrderAmount,
              estimatedTime: data.estimatedTime,
              isActive: true,
            },
          });
        }
      } else {
        const newArea = await createMutation.mutateAsync(areaPayload);
        if (data.isDeliveryActive) {
          await updateZoneMutation.mutateAsync({
            areaId: newArea._id,
            payload: {
              deliveryFee: data.deliveryFee,
              minOrderAmount: data.minOrderAmount,
              estimatedTime: data.estimatedTime,
              isActive: true,
            },
          });
        }
      }
      onClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!editArea) return;
    try {
      await deleteMutation.mutateAsync(editArea._id);
      setShowDeleteDialog(false);
      onClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isDeliveryActive = form.watch('isDeliveryActive');
  const polygonValid = polygon && polygon.coordinates?.[0]?.length >= 4;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              {isEditing ? `Edit ${editArea?.name}` : 'Add New Area'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Gulberg III" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Lahore">Lahore</SelectItem>
                          <SelectItem value="Islamabad">Islamabad</SelectItem>
                          <SelectItem value="Karachi">Karachi</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Map for Polygon Drawing */}
              <div className="space-y-2">
                <FormLabel>Delivery Zone Polygon</FormLabel>
                <p className="text-sm text-muted-foreground mb-2">
                  Click the polygon tool (top-right) to draw your delivery zone. Click points on the map and close the shape.
                </p>
                <div 
                  className={`relative rounded-lg overflow-hidden border-2 transition-colors ${
                    polygonValid ? 'border-green-500' : 'border-destructive/50'
                  }`}
                  style={{ height: '300px' }}
                >
                  <LeafletMap
                    areas={[]}
                    enableDraw={true}
                    editingPolygon={isEditing ? polygon : null}
                    onPolygonDrawn={handlePolygonDrawn}
                  />
                </div>
                {!polygonValid && (
                  <p className="text-sm text-destructive">
                    Please draw a valid polygon with at least 4 points
                  </p>
                )}
                {polygonValid && (
                  <p className="text-sm text-green-600">
                    ✓ Valid polygon with {polygon?.coordinates?.[0]?.length} points
                  </p>
                )}
              </div>

              {/* Delivery Settings */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Delivery Settings</h4>
                    <p className="text-sm text-muted-foreground">
                      Configure delivery for this area
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="isDeliveryActive"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <AnimatePresence>
                  {isDeliveryActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-3 gap-4"
                    >
                      <FormField
                        control={form.control}
                        name="deliveryFee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Fee (PKR)</FormLabel>
                            <FormControl>
                              <Input type="number" min={0} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="minOrderAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Min Order (PKR)</FormLabel>
                            <FormControl>
                              <Input type="number" min={0} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="estimatedTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Est. Time</FormLabel>
                            <FormControl>
                              <Input placeholder="30-45 min" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Error message */}
              {form.formState.errors.root && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.root.message}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                {isEditing ? (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Area
                  </Button>
                ) : (
                  <div />
                )}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading || !polygonValid}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isEditing ? 'Update Area' : 'Create Area'}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {editArea?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this delivery area and all associated delivery zone settings. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
