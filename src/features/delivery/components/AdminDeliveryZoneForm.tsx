import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Truck, Clock, CreditCard } from 'lucide-react';
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
import { useUpdateDeliveryZone } from '../hooks/useUpdateDeliveryZone';
import { Area } from '../types/area.types';

const zoneFormSchema = z.object({
  fee: z.coerce.number().min(0, 'Fee must be positive'),
  minOrder: z.coerce.number().min(0, 'Minimum order must be positive'),
  estimatedTime: z.string().min(1, 'Estimated time is required'),
  isActive: z.boolean().default(true),
});

type ZoneFormValues = z.infer<typeof zoneFormSchema>;

interface AdminDeliveryZoneFormProps {
  open: boolean;
  onClose: () => void;
  area: Area | null;
  existingZone?: {
    fee: number;
    minOrder: number;
    estimatedTime: string;
    isActive: boolean;
  } | null;
}

export const AdminDeliveryZoneForm = ({
  open,
  onClose,
  area,
  existingZone,
}: AdminDeliveryZoneFormProps) => {
  const { mutate: updateZone, isPending } = useUpdateDeliveryZone();

  const form = useForm<ZoneFormValues>({
    resolver: zodResolver(zoneFormSchema),
    defaultValues: {
      fee: existingZone?.fee || 50,
      minOrder: existingZone?.minOrder || 500,
      estimatedTime: existingZone?.estimatedTime || '35-45 min',
      isActive: existingZone?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (existingZone) {
      form.reset({
        fee: existingZone.fee,
        minOrder: existingZone.minOrder,
        estimatedTime: existingZone.estimatedTime,
        isActive: existingZone.isActive,
      });
    } else {
      form.reset({
        fee: 50,
        minOrder: 500,
        estimatedTime: '35-45 min',
        isActive: true,
      });
    }
  }, [existingZone, form, open]);

  const onSubmit = (values: ZoneFormValues) => {
    if (!area) return;

    updateZone(
      { areaId: area._id, payload: values },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Delivery Zone Settings</SheetTitle>
          <SheetDescription>
            Configure delivery rules for {area?.name || 'this area'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Delivery Fee (Rs.)
                  </FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Minimum Order (Rs.)
                  </FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="500" {...field} />
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
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Estimated Delivery Time
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="35-45 min" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel className="text-base">Active</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Enable delivery to this zone
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
                ) : (
                  'Save Zone'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
