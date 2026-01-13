// src/features/riders/context/RiderContext.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useRiderProfile } from '../hooks/useRiders';
import type { RiderProfile } from '../types/rider.types';

interface RiderContextType {
  profile: RiderProfile | null | undefined;
  isLoading: boolean;
  isError: boolean;
}

const RiderContext = createContext<RiderContextType | undefined>(undefined);

export function RiderProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, isError } = useRiderProfile();

  const value = {
    profile: data,
    isLoading,
    isError,
  };

  return <RiderContext.Provider value={value}>{children}</RiderContext.Provider>;
}

export function useRider() {
  const context = useContext(RiderContext);
  if (context === undefined) {
    throw new Error('useRider must be used within a RiderProvider');
  }
  return context;
}