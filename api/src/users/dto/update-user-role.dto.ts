import { IsEnum } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

/** Used by a superadmin to change another user's role. */
export class UpdateUserRoleDto {
  @IsEnum(Role)
  role!: Role;
}
