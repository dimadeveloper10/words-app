import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/auth';
import type { User } from '../../types/auth';
import { getMe } from './auth.api';
import { authKeys } from './auth.keys';

export function useSession(): UseQueryResult<User> {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: authKeys.me,
    queryFn: getMe,
    enabled: Boolean(token),
    retry: false,
    staleTime: 60_000,
  });
}
