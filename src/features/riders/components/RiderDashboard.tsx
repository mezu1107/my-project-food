// src/features/riders/components/RiderDashboard.tsx
'use client';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ← correct import for React Router v6+
import { Loader2, MapPin, History, Wallet, Star } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { useRider } from '../context/RiderContext';
import { useCurrentOrder } from '../hooks/useRiders'; // ← assuming correct hook name
import { StatusToggle } from './StatusToggle';
import CurrentOrderCard from './CurrentOrderCard';

export default function RiderDashboard() {
  const { profile, isLoading: profileLoading, isError } = useRider();
  const { data: currentOrder, isLoading: orderLoading } = useCurrentOrder();
  const navigate = useNavigate(); // ← replacement for useRouter

  // Optional: background location tracking
  useEffect(() => {
    if (!profile?.isAvailable) return;

    let watchId: number | null = null;

    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          console.log('Background location:', position.coords.latitude, position.coords.longitude);
          // In real app → call useUpdateLocation().mutate({ lat, lng })
        },
        (err) => console.error('Geolocation error:', err),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [profile?.isAvailable]);

  if (profileLoading || orderLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Failed to load rider information. Please try again later.
      </div>
    );
  }

  const isApproved = profile.riderStatus === 'approved';

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="container flex items-center justify-between h-16 px-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Rider Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {profile.name} • {profile.phone}
            </p>
          </div>
          <StatusToggle />
        </div>
      </div>

      <main className="container px-4 py-6 space-y-6">
        {currentOrder ? (
          <CurrentOrderCard order={currentOrder} />
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No Active Delivery</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                {profile.isAvailable
                  ? "You're online and ready for new orders"
                  : 'Turn on availability to start receiving orders'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Wallet className="h-5 w-5" />} title="Earnings" value={`PKR ${profile.earnings.toLocaleString()}`} />
          <StatCard icon={<Star className="h-5 w-5" />} title="Rating" value={profile.rating.toFixed(1)} />
          <StatCard icon={<MapPin className="h-5 w-5" />} title="Deliveries" value={profile.totalDeliveries.toString()} />
          <StatCard
            icon={<Badge variant={profile.isAvailable ? 'default' : 'secondary'} className="h-5 w-5" />}
            title="Status"
            value={profile.isAvailable ? 'Online' : 'Offline'}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            size="lg"
            className="h-28 flex flex-col gap-2"
            onClick={() => navigate('/rider/orders')} // ← use navigate
          >
            <History className="h-6 w-6" />
            <span>Order History</span>
          </Button>

          {!isApproved && (
            <Button
              variant="default"
              size="lg"
              className="h-28 flex flex-col gap-2 bg-gradient-to-r from-primary to-primary/90"
              onClick={() => navigate('/rider/apply')} // ← use navigate
            >
              Become a Rider
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
        <div className="rounded-full bg-primary/10 p-3 mb-3">{icon}</div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xl font-bold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}