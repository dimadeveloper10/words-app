import type { Role } from '@/types/auth';

export const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'superadmin', label: 'Superadmin' },
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
];

export function roleLabel(role: Role): string {
  return ROLE_OPTIONS.find((o) => o.value === role)?.label ?? role;
}

export function roleBadgeVariant(
  role: Role,
): 'default' | 'secondary' | 'outline' {
  switch (role) {
    case 'superadmin':
      return 'default';
    case 'admin':
      return 'secondary';
    default:
      return 'outline';
  }
}
