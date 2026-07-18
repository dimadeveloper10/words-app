import { AlertCircle, Loader2 } from 'lucide-react';
import { isAxiosError } from 'axios';

import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { RoleCell } from './RoleCell';
import { useUsers } from './useUsers';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function UsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  const isSuperadmin = currentUser?.role === 'superadmin';
  const { data: users, isLoading, isError, error } = useUsers();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-muted-foreground text-sm">
          {isSuperadmin
            ? 'Manage users and their roles.'
            : 'View admin panel users.'}
        </p>
      </div>

      <Card>
        <CardContent className="px-0">
          {isLoading && (
            <div className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Loading users…
            </div>
          )}

          {isError && (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center text-sm">
              <AlertCircle className="text-destructive size-5" />
              {isAxiosError(error) && error.response?.status === 403
                ? "You don't have permission to view users."
                : getApiErrorMessage(error, 'Failed to load users.')}
            </div>
          )}

          {!isLoading && !isError && users && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="pr-6">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground py-12 text-center"
                    >
                      No users yet.
                    </TableCell>
                  </TableRow>
                )}
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="pl-6 font-medium">
                      {user.name ?? '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <RoleCell
                        user={user}
                        editable={isSuperadmin}
                        isSelf={user.id === currentUser?.id}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground pr-6">
                      {formatDate(user.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
