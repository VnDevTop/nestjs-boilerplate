import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum } from 'class-validator';

import { Role } from '../../../common/enums/role.enum.js';

/**
 * DTO for changing a user's roles.
 *
 * @class ChangeRolesDto
 */
export class ChangeRolesDto {
  @ApiProperty({
    type: [String],
    enum: Role,
    example: [Role.USER],
    description: 'Roles to assign to the user.',
  })
  @IsArray()
  @IsEnum(Role, { each: true })
  roles!: Role[];
}