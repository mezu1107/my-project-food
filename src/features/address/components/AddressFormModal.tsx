'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Address, AddressFormData, addressSchema, ADDRESS_LABELS } from '../types/address.types';
import { useAreasByCity, useCreateAddress, useUpdateAddress } from '../hooks/useAddresses';
import { useCheckArea } from '@/hooks/useCheckArea';
import { formatPrice } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  address?: Address | null;
}

const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad'] as const;

export const AddressFormModal = ({ open, onClose, address }: Props) => {
  const isMobile = useIsMobile();
  const [city, setCity] = useState<string>(address?.area.city || 'Lahore');
  const [areaId, setAreaId] = useState<string>(address?.area._id || '');

  const { data: areas = [], isLoading: loadingAreas } = useAreasByCity(city);
  const selectedAreaCenter = areas.find(a => a._id === areaId)?.centerLatLng || { lat: 31.5204, lng: 74.3587 };

  // This is the React Query result (raw CheckAreaResponse)
  const { data: checkData, isLoading: checking } = useCheckArea(selectedAreaCenter.lat, selectedAreaCenter.lng);

  const create = useCreateAddress();
  const update = useUpdateAddress();

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: address?.label || 'Home',
      fullAddress: address?.fullAddress || '',
      areaId: address?.area._id || '',
      instructions: address?.instructions || '',
      isDefault: address?.isDefault || false,
    },
  });

  useEffect(() => {
    if (open) {
      setCity(address?.area.city || 'Lahore');
      setAreaId(address?.area._id || '');
      form.reset({
        label: address?.label || 'Home',
        fullAddress: address?.fullAddress || '',
        areaId: address?.area._id || '',
        instructions: address?.instructions || '',
        isDefault: address?.isDefault || false,
      });
    }
  }, [open, address, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      if (address) {
        await update.mutateAsync({ id: address._id, data });
      } else {
        await create.mutateAsync(data);
      }
      onClose();
    } catch (_) {}
  });

  const isPending = create.isPending || update.isPending;

  // Extract from raw response (no `select` used in useCheckArea)
  const inService = checkData?.inService ?? false;
  const deliveryFee = checkData?.delivery?.fee ?? 199;

  const Content = (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label>Label *</Label>
        <Select value={form.watch('label')} onValueChange={(v) => form.setValue('label', v as any)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {ADDRESS_LABELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Full Address *</Label>
        <Textarea
          placeholder="House no, street, apartment, landmark..."
          rows={3}
          {...form.register('fullAddress')}
        />
        <p className="text-xs text-muted-foreground">
          {form.watch('fullAddress')?.length || 0}/200
        </p>
      </div>

      <div className="space-y-2">
        <Label>City *</Label>
        <Select value={city} onValueChange={(v) => { setCity(v); setAreaId(''); }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Area *</Label>
        <Select value={areaId} onValueChange={setAreaId} disabled={loadingAreas}>
          <SelectTrigger>
            <SelectValue placeholder={loadingAreas ? 'Loading areas...' : 'Select area'} />
          </SelectTrigger>
          <SelectContent>
            {areas.map(area => (
              <SelectItem key={area._id} value={area._id}>{area.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Delivery Availability</Label>
        <div className="p-4 bg-muted/50 rounded-lg min-h-[56px] flex items-center">
          {checking ? (
            <p className="text-sm flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking delivery...
            </p>
          ) : inService ? (
            <p className="text-sm text-emerald-600 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Delivery available • {formatPrice(deliveryFee)}
            </p>
          ) : areaId ? (
            <p className="text-sm text-destructive flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Sorry, we don't deliver here yet
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select an area to check delivery
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Delivery Instructions (optional)</Label>
        <Textarea
          placeholder="Gate code, floor, bell name..."
          rows={2}
          {...form.register('instructions')}
        />
      </div>

      <div className="flex items-center space-x-3">
        <Checkbox
          id="default"
          checked={form.watch('isDefault')}
          onCheckedChange={(v) => form.setValue('isDefault', !!v)}
        />
        <Label htmlFor="default" className="cursor-pointer">Set as default address</Label>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isPending || !inService || !areaId || checking}
      >
        {isPending ? (
          <>Saving...</>
        ) : (
          <>{address ? 'Update' : 'Save'} Address</>
        )}
      </Button>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
        <DrawerContent>
          <DrawerHeader><DrawerTitle>{address ? 'Edit' : 'Add New'} Address</DrawerTitle></DrawerHeader>
          <div className="p-4 overflow-y-auto max-h-[70vh]">{Content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{address ? 'Edit' : 'Add New'} Address</DialogTitle></DialogHeader>
        {Content}
      </DialogContent>
    </Dialog>
  );
};