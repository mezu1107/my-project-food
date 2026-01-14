// src/features/riders/admin/pages/PromoteToRiderPage.tsx
// RESPONSIVE PRODUCTION VERSION — JANUARY 14, 2026
// Admin page to promote any user to rider (with documents upload support)

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, AlertTriangle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

import { usePromoteToRider } from '../../hooks/useAdminRiders';
import type { RiderDocuments } from '../../types/adminRider.types';

export default function PromoteToRiderPage() {
  const navigate = useNavigate();
  const promoteMutation = usePromoteToRider();

  const [userId, setUserId] = useState('');
  const [vehicleType, setVehicleType] = useState<'bike' | 'car' | 'bicycle'>('bike');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [cnicNumber, setCnicNumber] = useState('');

  const handlePromote = async () => {
    if (!userId.trim()) {
      toast.error('Please enter a valid User ID');
      return;
    }

    const riderDocuments: Partial<RiderDocuments> = {
      vehicleType,
      vehicleNumber: vehicleNumber.trim() || undefined,
      cnicNumber: cnicNumber.trim() || undefined,
    };

    promoteMutation.mutate(
      { id: userId.trim(), riderDocuments },
      {
        onSuccess: (data) => {
          toast.success(data.message || 'User promoted to rider');
          navigate(`/admin/riders/${data.rider?.id}`);
        },
        onError: () => {
          toast.error('Failed to promote user to rider');
        },
      }
    );
  };

  return (
    <div className="min-h-screen space-y-6 pb-12 px-4 py-6 md:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Promote User to Rider
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Convert any existing user into a verified rider account
          </p>
        </div>
      </div>

      <Card className="border-border max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">Promote User</CardTitle>
          <CardDescription className="text-sm">
            Enter the user ID and basic rider details. Documents can be updated later.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* User ID */}
          <div className="space-y-2">
            <Label htmlFor="userId">User ID <span className="text-red-500">*</span></Label>
            <Input
              id="userId"
              placeholder="Enter the exact User ID (e.g. 64a1b2c3d4e5f6a7b8c9d0e1)"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              You can find User IDs in the Users/Customer list page
            </p>
          </div>

          {/* Vehicle Type */}
          <div className="space-y-2">
            <Label htmlFor="vehicleType">Vehicle Type <span className="text-red-500">*</span></Label>
            <Select value={vehicleType} onValueChange={(v) => setVehicleType(v as typeof vehicleType)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bike">Bike</SelectItem>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="bicycle">Bicycle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vehicle Number (optional) */}
          <div className="space-y-2">
            <Label htmlFor="vehicleNumber">Vehicle Registration Number</Label>
            <Input
              id="vehicleNumber"
              placeholder="e.g. ABC-1234 or LEO-567"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              className="h-10"
            />
          </div>

          {/* CNIC Number (optional) */}
          <div className="space-y-2">
            <Label htmlFor="cnicNumber">CNIC Number</Label>
            <Input
              id="cnicNumber"
              placeholder="e.g. 35202-1234567-8"
              value={cnicNumber}
              onChange={(e) => setCnicNumber(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <Button
              onClick={handlePromote}
              disabled={promoteMutation.isPending || !userId.trim()}
              className="w-full sm:w-auto min-w-[180px] h-11"
            >
              {promoteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Promoting...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Promote to Rider
                </>
              )}
            </Button>
          </div>

          {/* Warning */}
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-300">
                <strong className="block mb-1">Important:</strong>
                This action is irreversible. The user will immediately become a rider and can go online.
                Make sure the user has submitted proper documents in the user profile.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}