import { Navigate, Outlet } from 'react-router-dom';

import { useAuthStore } from '@/stores/auth';

/** Redirects authenticated users away from auth pages (login/register). */
export function PublicOnlyRoute() {
  const token = useAuthStore((s) => s.token);

  if (token) {
    return <Navigate to="/users" replace />;
  }

  return <Outlet />;
}
