// src/features/riders/components/StatusToggle.tsx
'use client';

import { useRider } from '../context/RiderContext';
import { useToggleAvailability } from '../hooks/useRiders';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatusToggle() {
  const { profile } = useRider();
  const toggleAvailability = useToggleAvailability();

  if (!profile) return null;

  const isApproved = profile.riderStatus === 'approved';

  if (!isApproved) {
    return (
      <div className="flex items-center gap-2 opacity-60">
        <Switch disabled />
        <span className="text-sm font-medium">Offline</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Label
        htmlFor="availability-toggle"
        className={cn(
          'text-sm font-medium transition-colors',
          profile.isAvailable ? 'text-green-600' : 'text-muted-foreground'
        )}
      >
        {profile.isAvailable ? 'Online' : 'Offline'}
      </Label>

      <div className="relative">
        <Switch
          id="availability-toggle"
          checked={profile.isAvailable}
          onCheckedChange={() => toggleAvailability.mutate()}
          disabled={toggleAvailability.isPending}
          className={cn(
            'data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600',
            toggleAvailability.isPending && 'opacity-70'
          )}
        />

        {toggleAvailability.isPending && (
          <Loader2 className="absolute inset-0 m-auto h-4 w-4 animate-spin text-white" />
        )}
      </div>
    </div>
  );
}