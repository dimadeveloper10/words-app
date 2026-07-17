export enum Role {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  USER = 'user',
}

/**
 * Role hierarchy rank. A higher rank inherits access of every lower rank,
 * i.e. superadmin ⊇ admin ⊇ user.
 */
export const ROLE_RANK: Record<Role, number> = {
  [Role.SUPERADMIN]: 3,
  [Role.ADMIN]: 2,
  [Role.USER]: 1,
};
