import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role, ROLE_RANK } from '../enums/role.enum';

interface RequestWithUser {
  user?: { role?: Role };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @Roles() on the route → any authenticated user passes.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();

    if (!user?.role) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // Hierarchy: user passes if their rank meets the lowest required rank.
    const requiredMinRank = Math.min(...requiredRoles.map((r) => ROLE_RANK[r]));

    if (ROLE_RANK[user.role] < requiredMinRank) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
