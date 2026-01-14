// src/features/riders/admin/pages/RiderDetailPage.tsx
// FINAL PRODUCTION VERSION with BREADCRUMBS — JANUARY 14, 2026
// Fully responsive: mobile/tablet/desktop/widescreen friendly
// Includes: adaptive grid, touch targets, breadcrumbs navigation, loading/error states

import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Star,
  Truck,
  Calendar,
  AlertTriangle,
  Ban,
  RefreshCw,
  Home,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import {
  useAdminRider,
  useApproveRider,
  useRejectRider,
  useBlockRider,
  useUnblockRider,
  usePermanentlyBanRider,
  useSoftDeleteRider,
  useRestoreRider,
} from '../../hooks/useAdminRiders';

import { RiderStatusBadge } from '../components/RiderStatusBadge';
import { RiderDocumentsViewer } from '../components/RiderDocumentsViewer';
import { RiderModerationDialog } from '../components/RiderModerationDialog';
import Breadcrumbs from '@/components/admin/Breadcrumbs'; // ← Breadcrumbs imported

export default function RiderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <div className="text-center py-12 text-destructive">
        Invalid rider ID
      </div>
    );
  }

  const { data: rider, isLoading, error, refetch } = useAdminRider(id);

  const approve = useApproveRider();
  const reject = useRejectRider();
  const block = useBlockRider();
  const unblock = useUnblockRider();
  const ban = usePermanentlyBanRider();
  const softDelete = useSoftDeleteRider();
  const restore = useRestoreRider();

  // Loading state with breadcrumbs
  if (isLoading) {
    return (
      <div className="min-h-screen space-y-6 px-4 py-6 md:px-6 lg:px-8">
        <Breadcrumbs /> {/* Shows loading breadcrumbs */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-3/4 max-w-xs" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl md:col-span-2 lg:col-span-2" />
        </div>
      </div>
    );
  }

  // Error / Not Found state with breadcrumbs
  if (error || !rider) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center space-y-6">
        <Breadcrumbs /> {/* Shows error breadcrumbs */}
        <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 text-amber-500 mb-6" />
        <h2 className="text-2xl font-bold sm:text-3xl">Rider Not Found</h2>
        <p className="text-muted-foreground max-w-md">
          The rider may have been deleted, or the link is invalid.
        </p>
        <Button className="mt-8" onClick={() => navigate('/admin/riders')}>
          Back to Riders List
        </Button>
      </div>
    );
  }

  const isPending = rider.riderStatus === 'pending';
  const isApproved = rider.riderStatus === 'approved';
  const isBlocked = rider.isBlocked === true;
  const isDeleted = rider.isDeleted === true;

  return (
    <div className="min-h-screen space-y-6 px-4 py-6 md:px-6 lg:px-8 lg:space-y-8">
      {/* Breadcrumbs - top of page */}
      <Breadcrumbs
        items={[
          { label: 'Dashboard', path: '/admin', icon: Home },
          { label: 'Riders Management', path: '/admin/riders' },
          { label: rider.name || 'Rider Details' }, // current page (non-clickable)
        ]}
      />

      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            asChild
          >
            <Link to="/admin/riders" aria-label="Back to riders list">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl truncate">
              {rider.name}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <RiderStatusBadge status={rider.riderStatus} />
              <span className="text-xs sm:text-sm font-mono text-muted-foreground">
                ID: {rider._id.slice(-8).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="min-w-[100px]"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          {isApproved && !isBlocked && !isDeleted && (
            <RiderModerationDialog
              rider={rider}
              type="block"
              onConfirm={(reason) => block.mutate({ id: rider._id, reason })}
              trigger={
                <Button variant="outline" size="sm" className="min-w-[100px]">
                  Block
                </Button>
              }
            />
          )}

          {isBlocked && (
            <Button
              variant="default"
              size="sm"
              onClick={() => unblock.mutate(rider._id)}
              className="min-w-[120px]"
            >
              Unblock Rider
            </Button>
          )}

          {isApproved && !isDeleted && (
            <RiderModerationDialog
              rider={rider}
              type="permanent-ban"
              onConfirm={(reason) => ban.mutate({ id: rider._id, reason })}
              trigger={
                <Button variant="destructive" size="sm" className="min-w-[130px]">
                  Permanent Ban
                </Button>
              }
            />
          )}

          {!isDeleted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => softDelete.mutate(rider._id)}
              className="min-w-[120px]"
            >
              Soft Delete
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => restore.mutate(rider._id)}
              className="min-w-[130px]"
            >
              Restore Account
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm sm:text-base">
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium text-muted-foreground">Phone</p>
                  <p className="font-mono">{rider.phone}</p>
                </div>
              </div>

              {rider.email && (
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-medium text-muted-foreground">Email</p>
                    <p className="break-all">{rider.email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium text-muted-foreground">Joined</p>
                  <p>{format(new Date(rider.createdAt), 'dd MMMM yyyy')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Star className="mt-0.5 h-5 w-5 text-yellow-500 shrink-0" />
                <div>
                  <p className="font-medium text-muted-foreground">Rating</p>
                  <p className="text-lg font-bold">{rider.rating.toFixed(1)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Truck className="mt-0.5 h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium text-muted-foreground">Total Deliveries</p>
                  <p className="text-lg font-bold">{rider.totalDeliveries ?? 0}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Availability */}
            <div className="space-y-3">
              <h4 className="font-medium">Availability Status</h4>
              <div className="flex flex-wrap gap-3">
                <Badge
                  variant={rider.isAvailable ? 'default' : 'secondary'}
                  className="text-sm px-3 py-1"
                >
                  {rider.isAvailable ? 'Available' : 'Unavailable'}
                </Badge>

                {rider.isOnline !== undefined && (
                  <Badge
                    variant={rider.isOnline ? 'default' : 'outline'}
                    className="text-sm px-3 py-1"
                  >
                    {rider.isOnline ? 'Online' : 'Offline'}
                  </Badge>
                )}
              </div>
            </div>

            {/* Location */}
            {rider.currentLocation && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Last Known Location
                </h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    Lat: {rider.currentLocation.coordinates[1].toFixed(6)}, Lng:{' '}
                    {rider.currentLocation.coordinates[0].toFixed(6)}
                  </p>
                  {rider.locationUpdatedAt && (
                    <p className="text-xs">
                      Updated:{' '}
                      {format(new Date(rider.locationUpdatedAt), 'dd MMM yyyy • HH:mm')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents Card */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Verification Documents</CardTitle>
            <CardDescription className="text-sm">
              Uploaded during registration or promotion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RiderDocumentsViewer
              documents={rider.riderDocuments}
              riderName={rider.name}
            />
          </CardContent>
        </Card>

        {/* Moderation History */}
        {(rider.blockReason || rider.banReason || rider.rejectionReason) && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Moderation History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {rider.rejectionReason && rider.riderStatus === 'rejected' && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/80 dark:bg-amber-950/30 p-4">
                  <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">
                    Rejection Reason
                  </h4>
                  <p className="text-sm leading-relaxed">{rider.rejectionReason}</p>
                </div>
              )}

              {rider.blockReason && (
                <div className="rounded-lg border border-red-200 bg-red-50/80 dark:bg-red-950/30 p-4">
                  <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
                    Block Reason
                  </h4>
                  <p className="text-sm leading-relaxed">{rider.blockReason}</p>
                  {rider.blockedAt && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Blocked on: {format(new Date(rider.blockedAt), 'dd MMM yyyy • HH:mm')}
                    </p>
                  )}
                </div>
              )}

              {rider.banReason && (
                <div className="rounded-lg border border-red-300 bg-red-100/80 dark:bg-red-900/40 p-4">
                  <h4 className="font-medium text-red-900 dark:text-red-200 mb-2">
                    Permanent Ban Reason
                  </h4>
                  <p className="text-sm leading-relaxed">{rider.banReason}</p>
                  {rider.bannedAt && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Banned on: {format(new Date(rider.bannedAt), 'dd MMM yyyy • HH:mm')}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 md:col-span-2 lg:col-span-3 justify-end pt-4 sm:pt-6">
          {isPending && (
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              <Button
                onClick={() => approve.mutate(rider._id)}
                className="flex-1 sm:flex-none min-w-[140px]"
              >
                Approve Rider
              </Button>

              <RiderModerationDialog
                rider={rider}
                type="reject"
                onConfirm={(reason) => reject.mutate({ id: rider._id, reason })}
              />
            </div>
          )}

          {isApproved && !isBlocked && (
            <RiderModerationDialog
              rider={rider}
              type="block"
              onConfirm={(reason) => block.mutate({ id: rider._id, reason })}
            />
          )}

          {isBlocked && (
            <Button
              onClick={() => unblock.mutate(rider._id)}
              className="min-w-[140px]"
            >
              Unblock Rider
            </Button>
          )}

          {isApproved && !isDeleted && (
            <RiderModerationDialog
              rider={rider}
              type="permanent-ban"
              onConfirm={(reason) => ban.mutate({ id: rider._id, reason })}
            />
          )}
        </div>
      </div>
    </div>
  );
}