import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Role, User } from '@/types/auth';
import { ROLE_OPTIONS, roleBadgeVariant, roleLabel } from './roles';
import { useUpdateUserRole } from './useUsers';

interface RoleCellProps {
  user: User;
  /** Whether the current viewer may edit roles (superadmin). */
  editable: boolean;
  /** True for the currently authenticated user's own row. */
  isSelf: boolean;
}

export function RoleCell({ user, editable, isSelf }: RoleCellProps) {
  const updateRole = useUpdateUserRole();

  if (!editable || isSelf) {
    return (
      <Badge variant={roleBadgeVariant(user.role)}>
        {roleLabel(user.role)}
      </Badge>
    );
  }

  return (
    <Select
      value={user.role}
      disabled={updateRole.isPending}
      onValueChange={(role: Role) => {
        if (role !== user.role) {
          updateRole.mutate({ id: user.id, role });
        }
      }}
    >
      <SelectTrigger size="sm" className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
