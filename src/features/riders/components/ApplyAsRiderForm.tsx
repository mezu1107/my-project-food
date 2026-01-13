// src/features/riders/components/ApplyAsRiderForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

import { useApplyAsRider } from '../hooks/useRiders';

// ── Validation Schema ───────────────────────────────────────────────────────
const formSchema = z.object({
  cnicNumber: z
    .string()
    .regex(/^\d{5}-\d{7}-\d{1}$/, 'CNIC must be in format: 35202-1234567-1'),
  vehicleType: z.enum(['bike', 'car', 'bicycle']),
  vehicleNumber: z
    .string()
    .min(3, 'Vehicle number is too short')
    .max(15, 'Vehicle number is too long')
    .regex(/^[A-Z0-9-]+$/, 'Only letters, numbers and hyphen allowed'),
});

type FormValues = z.infer<typeof formSchema>;

export default function ApplyAsRiderForm() {
  const [files, setFiles] = useState<{
    cnicFront: File | null;
    cnicBack: File | null;
    drivingLicense: File | null;
    riderPhoto: File | null;
  }>({
    cnicFront: null,
    cnicBack: null,
    drivingLicense: null,
    riderPhoto: null,
  });

  const applyMutation = useApplyAsRider();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cnicNumber: '',
      vehicleType: 'bike',
      vehicleNumber: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    // Check all files are uploaded
    if (!files.cnicFront || !files.cnicBack || !files.drivingLicense || !files.riderPhoto) {
      toast.error('Please upload all required documents');
      return;
    }

    try {
      await applyMutation.mutateAsync({
        cnicNumber: values.cnicNumber,
        vehicleType: values.vehicleType,
        vehicleNumber: values.vehicleNumber,
        cnicFront: files.cnicFront,
        cnicBack: files.cnicBack,
        drivingLicense: files.drivingLicense,
        riderPhoto: files.riderPhoto,
      });
      // Form will be reset automatically on success via toast & redirect
    } catch (err) {
      // Error is already handled in mutation toast
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof files) => {
    const file = e.target.files?.[0];
    if (file) {
      // Optional: add size/type validation here
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${field} file is too large (max 5MB)`);
        return;
      }
      setFiles((prev) => ({ ...prev, [field]: file }));
    }
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Become a Rider</CardTitle>
        <CardDescription>
          Please provide accurate information and upload clear documents
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* CNIC */}
            <FormField
              control={form.control}
              name="cnicNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNIC Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="35202-1234567-1" {...field} />
                  </FormControl>
                  <FormDescription>Format: XXXXX-XXXXXXX-X</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Vehicle Type */}
            <FormField
              control={form.control}
              name="vehicleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bike">Motorcycle / Bike</SelectItem>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="bicycle">Bicycle</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Vehicle Number */}
            <FormField
              control={form.control}
              name="vehicleNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Registration Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. LEC-19-1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Documents */}
            {[
              { key: 'cnicFront' as const, label: 'CNIC Front' },
              { key: 'cnicBack' as const, label: 'CNIC Back' },
              { key: 'drivingLicense' as const, label: 'Driving License' },
              { key: 'riderPhoto' as const, label: 'Your Photo (with face visible)' },
            ].map(({ key, label }) => (
              <FormItem key={key}>
                <FormLabel>{label} *</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => handleFileChange(e, key)}
                  />
                </FormControl>
                {files[key] && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Selected: {files[key]!.name}
                  </p>
                )}
              </FormItem>
            ))}

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={applyMutation.isPending || form.formState.isSubmitting}
            >
              {applyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                'Submit Rider Application'
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Your application will be reviewed within 24-48 hours
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}