// src/features/riders/pages/RiderProfile.tsx
import { ArrowLeft, User, ShieldCheck, Bike, Star, Package, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // ← correct import

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { useRider } from '../context/RiderContext';

export default function RiderProfile() {
  const { profile, isLoading } = useRider();
  const navigate = useNavigate();

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 rounded-full bg-muted mx-auto mb-4"></div>
          <div className="h-6 w-48 bg-muted rounded mx-auto mb-2"></div>
          <div className="h-4 w-32 bg-muted rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b supports-[backdrop-filter]:bg-background/80">
        <div className="container flex items-center h-16 px-4">
          <Button variant="ghost" size="icon" className="mr-3" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight">Rider Profile</h1>
        </div>
      </div>

      <main className="flex-1 container px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-8 pb-6 flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4 border-4 border-background shadow-xl">
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="text-muted-foreground mt-1">{profile.phone}</p>

              <div className="flex items-center gap-2 mt-3">
                <Badge
                  variant={profile.riderStatus === 'approved' ? 'default' : 'secondary'}
                  className="text-base px-4 py-1"
                >
                  {profile.riderStatus === 'approved'
                    ? 'Approved Rider'
                    : profile.riderStatus === 'pending'
                    ? 'Application Pending'
                    : 'Not a Rider'}
                </Badge>

                {profile.isAvailable && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Online Now
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <ProfileStatCard
              icon={<Star className="h-6 w-6" />}
              title="Rating"
              value={profile.rating.toFixed(1)}
              subtitle="out of 5"
            />
            <ProfileStatCard
              icon={<Package className="h-6 w-6" />}
              title="Deliveries"
              value={profile.totalDeliveries.toString()}
              subtitle="completed"
            />
            <ProfileStatCard
              icon={<Wallet className="h-6 w-6" />}
              title="Earnings"
              value={`PKR ${profile.earnings.toLocaleString()}`}
              subtitle="total"
            />
          </div>

          {/* Vehicle & Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle & Documents</CardTitle>
              <CardDescription>Your registered vehicle information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Bike className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Vehicle Details</h3>
                  <p className="text-sm mt-1">
                    {profile.riderDocuments?.vehicleType === 'bike'
                      ? 'Motorcycle'
                      : profile.riderDocuments?.vehicleType === 'car'
                      ? 'Car'
                      : 'Bicycle'}
                    {profile.riderDocuments?.vehicleNumber && (
                      <span className="font-medium ml-2">
                        • {profile.riderDocuments.vehicleNumber}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Verification Status</h3>
                  <p className="text-sm mt-1">
                    {profile.riderStatus === 'approved'
                      ? 'All documents verified and approved'
                      : 'Pending verification'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Full Name</span>
                <span className="font-medium">{profile.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone Number</span>
                <span className="font-medium">{profile.phone}</span>
              </div>
              {profile.email && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{profile.email}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function ProfileStatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <Card>
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="rounded-full bg-primary/10 p-4 mb-4">{icon}</div>
        <h3 className="text-2xl font-bold">{value}</h3>
        <p className="text-sm font-medium mt-1">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}