import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';

/**
 * Restrict a route to the given roles (or higher in the hierarchy).
 * Example: `@Roles(Role.ADMIN)` allows admin and superadmin.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
