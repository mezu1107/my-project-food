import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
import { useCreateArea, useUpdateArea } from '../hooks/useAdminAreas';
import { Area, GeoJSONPolygon } from '../types/area.types';
import { PolygonMapDrawer } from './PolygonMapDrawer';
import { calculatePolygonCenter, validatePolygon } from '../lib/polygonUtils';

const areaFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  city: z.string().default('Lahore'),
  isActive: z.boolean().default(false),
});

type AreaFormValues = z.infer<typeof areaFormSchema>;

interface AdminAreaFormProps {
  open: boolean;
  onClose: () => void;
  editArea?: Area | null;
}

export const AdminAreaForm = ({ open, onClose, editArea }: AdminAreaFormProps) => {
  const [polygon, setPolygon] = useState<GeoJSONPolygon | null>(
    editArea?.polygon || null
  );
  const [polygonError, setPolygonError] = useState<string | null>(null);

  const { mutate: createArea, isPending: isCreating } = useCreateArea();
  const { mutate: updateArea, isPending: isUpdating } = useUpdateArea();
  const isPending = isCreating || isUpdating;

  const form = useForm<AreaFormValues>({
    resolver: zodResolver(areaFormSchema),
    defaultValues: {
      name: editArea?.name || '',
      city: editArea?.city || 'Lahore',
      isActive: editArea?.isActive || false,
    },
  });

  useEffect(() => {
    if (editArea) {
      form.reset({
        name: editArea.name,
        city: editArea.city,
        isActive: editArea.isActive,
      });
      setPolygon(editArea.polygon);
    } else {
      form.reset({
        name: '',
        city: 'Lahore',
        isActive: false,
      });
      setPolygon(null);
    }
    setPolygonError(null);
  }, [editArea, form, open]);

  const handlePolygonChange = (newPolygon: GeoJSONPolygon) => {
    setPolygon(newPolygon);
    const validation = validatePolygon(newPolygon);
    setPolygonError(validation.valid ? null : validation.error || null);
  };

  const onSubmit = (values: AreaFormValues) => {
    if (!polygon) {
      setPolygonError('Please draw the delivery area polygon');
      return;
    }

    const validation = validatePolygon(polygon);
    if (!validation.valid) {
      setPolygonError(validation.error || 'Invalid polygon');
      return;
    }

    const center = calculatePolygonCenter(polygon.coordinates[0]);

    if (editArea) {
      updateArea(
        { id: editArea._id, payload: { ...values, polygon, center } },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      createArea({ name: values.name, city: values.city, polygon, center }, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editArea ? 'Edit Area' : 'Create New Area'}</SheetTitle>
          <SheetDescription>
            {editArea
              ? 'Update the delivery area details and coverage'
              : 'Add a new delivery area with polygon coverage'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Gulberg" {...field} />
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
                    <FormControl>
                      <Input placeholder="Lahore" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Enable delivery to this area
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Polygon Drawer */}
            <div className="space-y-2">
              <FormLabel>Coverage Area</FormLabel>
              <p className="text-sm text-muted-foreground mb-2">
                Click on the map to draw the delivery coverage polygon
              </p>
              <PolygonMapDrawer
                initialPolygon={polygon}
                onChange={handlePolygonChange}
              />
              {polygonError && (
                <p className="text-sm text-destructive">{polygonError}</p>
              )}
            </div>

            {/* Center coordinates (auto-calculated) */}
            {polygon && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Center:{' '}
                  <span className="font-mono">
                    {calculatePolygonCenter(polygon.coordinates[0]).lat.toFixed(4)},{' '}
                    {calculatePolygonCenter(polygon.coordinates[0]).lng.toFixed(4)}
                  </span>
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editArea ? (
                  'Update Area'
                ) : (
                  'Create Area'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
