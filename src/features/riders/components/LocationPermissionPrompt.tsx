// src/features/riders/components/LocationPermissionPrompt.tsx
'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, MapPin, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type PermissionStatus = 'prompt' | 'granted' | 'denied' | 'checking' | 'unavailable';

interface LocationPermissionPromptProps {
  onPermissionGranted: () => void;
}

export default function LocationPermissionPrompt({ onPermissionGranted }: LocationPermissionPromptProps) {
  const [status, setStatus] = useState<PermissionStatus>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkAndRequestPermission = async () => {
    if (!navigator.geolocation) {
      setStatus('unavailable');
      setErrorMessage('Geolocation is not supported by your browser');
      return;
    }

    try {
      setStatus('checking');

      // Modern way: check permission status first (supported in most modern browsers)
      const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });

      if (permission.state === 'granted') {
        setStatus('granted');
        onPermissionGranted();
        return;
      }

      if (permission.state === 'denied') {
        setStatus('denied');
        return;
      }

      // Prompt for permission
      setStatus('prompt');

      // Trigger permission prompt
      navigator.geolocation.getCurrentPosition(
        () => {
          setStatus('granted');
          onPermissionGranted();
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            setStatus('denied');
          } else {
            setStatus('denied');
            setErrorMessage(err.message);
          }
        },
        { timeout: 10000, maximumAge: 0 }
      );
    } catch (err) {
      console.error('Permission check error:', err);
      setStatus('denied');
      setErrorMessage('Could not check location permission status');
    }
  };

  useEffect(() => {
    checkAndRequestPermission();
  }, []);

  if (status === 'granted') {
    return null; // Permission granted → component disappears
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <MapPin className="h-8 w-8 text-primary" />
            <CardTitle>Location Access Required</CardTitle>
          </div>
          <CardDescription>
            We need your location to track deliveries and connect you with nearby orders
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {status === 'checking' && (
            <div className="flex flex-col items-center py-6">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Checking location permission...</p>
            </div>
          )}

          {status === 'prompt' && (
            <Alert>
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Permission Required</AlertTitle>
              <AlertDescription>
                Please allow location access when prompted by your browser to continue.
              </AlertDescription>
            </Alert>
          )}

          {status === 'denied' && (
            <>
              <Alert variant="destructive">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle>Location Access Denied</AlertTitle>
                <AlertDescription>
                  {errorMessage ||
                    'You have blocked location access. Please enable it in your browser settings.'}
                </AlertDescription>
              </Alert>

              <div className="text-sm space-y-2">
                <p className="font-medium">How to enable:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Chrome: Settings → Privacy and security → Site Settings → Location</li>
                  <li>Safari: Settings → Privacy → Location Services</li>
                  <li>Firefox: Settings → Privacy & Security → Permissions → Location</li>
                </ul>
              </div>
            </>
          )}

          {status === 'unavailable' && (
            <Alert variant="destructive">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Geolocation Not Supported</AlertTitle>
              <AlertDescription>
                Your browser or device does not support location services.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          {status === 'denied' && (
            <Button variant="outline" onClick={checkAndRequestPermission}>
              Try Again
            </Button>
          )}

          {status === 'prompt' && (
            <Button onClick={checkAndRequestPermission}>
              Allow Location Access
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}