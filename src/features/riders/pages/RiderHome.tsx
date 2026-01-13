// src/features/riders/pages/RiderHome.tsx
import { useEffect, useState } from 'react'; // ← import React hooks
import { useNavigate } from 'react-router-dom'; // ← correct for React Router v6+
import { MapPin, History, Wallet, Star, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge'; 
import { useRider } from '../context/RiderContext';
import { useCurrentOrder } from '../hooks/useRiders'; // ← assuming correct hook file
import { StatusToggle } from '../components/StatusToggle';
import CurrentOrderCard from '../components/CurrentOrderCard';
import LocationPermissionPrompt from '../components/LocationPermissionPrompt';

export default function RiderHome() {
  const { profile, isLoading: profileLoading, isError } = useRider();
  const { data: currentOrder, isLoading: orderLoading } = useCurrentOrder();
  const navigate = useNavigate(); // ← replacement for useRouter

  const isApproved = profile?.riderStatus === 'approved';

  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  useEffect(() => {
    if (isApproved && profile?.isAvailable && navigator.geolocation) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          if (result.state === 'prompt') {
            setShowLocationPrompt(true);
          }
        })
        .catch(() => {
          // Fallback: show prompt anyway
          setShowLocationPrompt(true);
        });
    }
  }, [isApproved, profile?.isAvailable]);

  if (profileLoading || orderLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading rider dashboard...</p>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't load your rider information. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b supports-[backdrop-filter]:bg-background/80">
        <div className="container flex items-center justify-between h-16 px-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Rider Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {profile.name} • {profile.phone}
            </p>
          </div>
          <StatusToggle />
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Location Permission Prompt */}
        {showLocationPrompt && (
          <LocationPermissionPrompt onPermissionGranted={() => setShowLocationPrompt(false)} />
        )}

        {/* Application Banner for non-approved */}
        {!isApproved && (
          <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <AlertTitle>Become a Rider</AlertTitle>
            <AlertDescription className="mt-1">
              Complete your rider application to start accepting deliveries.
            </AlertDescription>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => navigate('/rider/apply')}
            >
              Apply Now
            </Button>
          </Alert>
        )}

        {/* Current Order */}
        {currentOrder ? (
          <CurrentOrderCard order={currentOrder} />
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <MapPin className="h-16 w-16 text-muted-foreground/50 mb-6" />
              <h3 className="text-xl font-medium mb-2">
                {profile.isAvailable ? 'Ready for Orders' : 'Go Online'}
              </h3>
              <p className="text-muted-foreground max-w-md">
                {profile.isAvailable
                  ? "You're online and ready to receive delivery requests"
                  : 'Turn on your availability to start getting orders in your area'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Wallet />} title="Earnings" value={`PKR ${profile.earnings.toLocaleString()}`} />
          <StatCard icon={<Star />} title="Rating" value={profile.rating.toFixed(1)} />
          <StatCard icon={<MapPin />} title="Deliveries" value={profile.totalDeliveries.toString()} />
          <StatCard
            icon={<Badge variant={profile.isAvailable ? 'default' : 'secondary'} className="h-5 w-5" />}
            title="Status"
            value={profile.isAvailable ? 'Online' : 'Offline'}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            size="lg"
            className="h-28 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate('/rider/orders')}
          >
            <History className="h-7 w-7" />
            <span>Order History</span>
          </Button>

          <Button
            variant="default"
            size="lg"
            className="h-28 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate('/rider/profile')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Profile</span>
          </Button>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5 flex flex-col items-center text-center">
        <div className="rounded-full bg-primary/10 p-3 mb-3">{icon}</div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xl font-bold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}