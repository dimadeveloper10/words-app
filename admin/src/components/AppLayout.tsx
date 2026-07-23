import { useQueryClient } from '@tanstack/react-query';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';

export function AppLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);

  const handleLogout = () => {
    clear();
    queryClient.clear();
    void navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-svh">
      <aside className="bg-muted/40 hidden w-60 shrink-0 flex-col border-r p-4 sm:flex">
        <div className="mb-6 px-2 text-lg font-semibold">Words Admin</div>
        <nav className="flex flex-col gap-1">
          <NavLink
            to="/users"
            end
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            <Users className="size-4" />
            Users
          </NavLink>

          <NavLink
            to="/words"
            end
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            <BookOpen className="size-4" />
            Words
          </NavLink>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-4 border-b px-4 sm:px-6">
          <span className="font-medium sm:hidden">Words Admin</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-muted-foreground hidden text-sm sm:inline">
              {user?.email}
              {user?.role ? ` · ${user.role}` : ''}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="size-4" />
              Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
