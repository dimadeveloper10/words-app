import type { JSX } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { useLogout } from '../features/auth/useLogout';
import type { User } from '../types/auth';
import { AppHeader } from './AppHeader';

export function AppLayout(): JSX.Element {
  const user = useOutletContext<User>();
  const logout = useLogout();

  return (
    <>
      <AppHeader email={user.email} onLogout={logout} />
      <Outlet context={user} />
    </>
  );
}
