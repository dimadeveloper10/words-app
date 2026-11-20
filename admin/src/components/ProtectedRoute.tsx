import { useQuery } from '@tanstack/react-query';
import { Navigate, Outlet } from 'react-router-dom';
import { type JSX, useEffect } from 'react';

import { getMe } from '@/features/auth/auth.api';
import { useAuthStore } from '@/stores/auth';

export function ProtectedRoute(): JSX.Element {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  // Re-validate the persisted token against the API on load. A 401 is handled
  // by the axios interceptor, which clears the store and triggers a redirect.
  const { data } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    enabled: !!token,
    retry: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data, setUser]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
