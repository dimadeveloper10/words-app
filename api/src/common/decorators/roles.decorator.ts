import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation } from '@nestjs/swagger';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';

/**
 * Restrict a route to the given roles (or higher in the hierarchy).
 * Example: `@Roles(Role.ADMIN)` allows admin and superadmin.
 */
export const Roles = (...roles: Role[]) =>
  applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    ApiOperation({
      description: `Requires one of these roles or higher: ${roles.join(', ')}.`,
    }),
    ApiForbiddenResponse({ description: 'Insufficient permissions' }),
  );
