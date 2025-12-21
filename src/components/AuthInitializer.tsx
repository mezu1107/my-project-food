// src/components/AuthInitializer.tsx
import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';

export const AuthInitializer = () => {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  useEffect(() => {
    if (!isInitialized) {
      checkAuth();
    }
  }, [checkAuth, isInitialized]);

  return null;
};