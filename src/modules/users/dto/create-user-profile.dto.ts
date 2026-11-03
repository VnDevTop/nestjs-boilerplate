import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

import { UpdateUserProfileDto } from './update-user-profile.dto.js';

/**
 * DTO for creating a user profile.
 *
 * @class CreateUserProfileDto
 */
export class CreateUserProfileDto extends UpdateUserProfileDto {
  @ApiPropertyOptional({
    type: String,
    example: 'user@example.com',
    description: 'User email address.',
  })
  @IsOptional()
  email?: string;
}