// src/components/admin/ProtectedAdminRoute.tsx
import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export const ProtectedAdminRoute = ({ children }: Props) => {
  const { user, isLoading, isAuthenticated, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      checkAuth();
    }
  }, [isAuthenticated, isLoading, checkAuth]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role !== 'admin') {
      navigate('/unauthorized', { replace: true });
    }
  }, [user, isLoading, isAuthenticated, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
};