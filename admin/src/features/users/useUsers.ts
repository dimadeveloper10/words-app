import {
  useMutation,
  type UseMutationResult,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { getApiErrorMessage } from '@/lib/api';
import type { Role, User } from '@/types/auth';
import { listUsers, updateUserRole } from './users.api';

export function useUsers(): UseQueryResult<User[]> {
  return useQuery({
    queryKey: ['users'],
    queryFn: listUsers,
    retry: false,
  });
}

export function useUpdateUserRole(): UseMutationResult<
  User,
  Error,
  { id: string; role: Role }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      updateUserRole(id, role),
    onSuccess: (user) => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`Role updated for ${user.email}`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update role'));
    },
  });
}
