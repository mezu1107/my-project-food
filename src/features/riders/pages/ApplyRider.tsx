// src/features/riders/pages/ApplyRider.tsx
'use client';  // ← you can keep this if you're using some RSC-like setup, otherwise remove it

import { ArrowLeft, CheckCircle2, Clock, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';   // ← the correct import for React Router v6+

import { useRider } from '../context/RiderContext';
import { useRiderApplicationStatus } from '../hooks/useRiders'; // make sure this file exists!

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import ApplyAsRiderForm from '../components/ApplyAsRiderForm';

export default function ApplyRider() {
  const navigate = useNavigate(); // ← replacement for useRouter()
  const { profile, isLoading: profileLoading } = useRider();
  const { data: appStatus, isLoading: statusLoading } = useRiderApplicationStatus();

  const isLoading = profileLoading || statusLoading;

  // Quick guard - already approved rider
  if (!isLoading && profile?.riderStatus === 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-6">
        <Card className="w-full max-w-md shadow-xl border-green-200/50">
          <CardContent className="pt-10 pb-12 text-center">
            <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Welcome, Approved Rider!</h1>
            <p className="text-muted-foreground mb-8">
              Your account is already verified. Start accepting deliveries now.
            </p>
            <Button
              size="lg"
              className="w-full md:w-auto px-10"
              onClick={() => navigate('/rider')} // ← use navigate instead of router.push
            >
              Go to Rider Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b supports-[backdrop-filter]:bg-background/80">
        <div className="container flex items-center h-16 px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-4"
            onClick={() => navigate(-1)} // ← go back
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Become a Rider</h1>
        </div>
      </div>

      <main className="flex-1 container px-4 md:px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-14 w-14 animate-spin text-primary mb-6" />
              <p className="text-lg text-muted-foreground">Checking application status...</p>
            </div>
          ) : (
            <Card className="shadow-2xl border-primary/20 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-8">
                <CardTitle className="text-2xl md:text-3xl font-bold">
                  Join Our Rider Team
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Submit your details and documents — we review applications within 24–48 hours
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-8 pb-12 space-y-10">
                {/* Application Status Banner */}
                {appStatus && appStatus.riderStatus !== 'none' && (
                  <Alert
                    variant={
                      appStatus.riderStatus === 'approved'
                        ? 'default'
                        : appStatus.riderStatus === 'pending'
                        ? 'default'
                        : 'destructive'
                    }
                    className="border-l-4 border-l-amber-500 bg-amber-50/70 dark:bg-amber-950/30"
                  >
                    {appStatus.riderStatus === 'pending' && (
                      <>
                        <Clock className="h-6 w-6 text-amber-600" />
                        <AlertTitle className="text-lg">Application Under Review</AlertTitle>
                        <AlertDescription className="mt-2 text-base">
                          Thank you for applying! Our team is currently reviewing your documents.
                          <br />
                          You will receive an SMS notification once a decision is made.
                        </AlertDescription>
                      </>
                    )}

                    {appStatus.riderStatus === 'rejected' && (
                      <>
                        <AlertCircle className="h-6 w-6" />
                        <AlertTitle className="text-lg">Application Not Approved</AlertTitle>
                        <AlertDescription className="mt-2 space-y-3">
                          <div>
                            <strong>Reason:</strong>{' '}
                            <span className="font-medium">
                              {appStatus.rejectionReason || 'No specific reason provided'}
                            </span>
                          </div>
                          <p className="text-sm">
                            You may submit a new application after addressing the feedback.
                          </p>
                        </AlertDescription>
                      </>
                    )}
                  </Alert>
                )}

                {/* Main content: Form or Pending Message */}
                {appStatus?.riderStatus === 'pending' ? (
                  <div className="py-16 text-center space-y-6">
                    <Clock className="h-20 w-20 text-amber-500 mx-auto" />
                    <h2 className="text-2xl font-bold">Application Received</h2>
                    <p className="text-muted-foreground max-w-lg mx-auto text-lg">
                      We have received your rider application. Our team will review it shortly.
                      <br />
                      Expect an update via SMS within the next 24–48 hours.
                    </p>
                    <Button
                      size="lg"
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate('/rider')}
                    >
                      Return to Dashboard
                    </Button>
                  </div>
                ) : (
                  <ApplyAsRiderForm />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <div className="h-20 md:hidden" />
    </div>
  );
}