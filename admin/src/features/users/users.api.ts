import { api } from '@/lib/api';
import type { Role, User } from '@/types/auth';

export async function listUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/users');
  return data;
}

export async function updateUserRole(id: string, role: Role): Promise<User> {
  const { data } = await api.patch<User>(`/users/${id}/role`, { role });
  return data;
}
