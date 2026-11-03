import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

/**
 * DTO for updating a user profile.
 *
 * @class UpdateUserProfileDto
 */
export class UpdateUserProfileDto {
  @ApiPropertyOptional({
    type: String,
    example: 'Jane Doe',
    description: 'Full display name.',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Jane',
    description: 'Given name.',
  })
  @IsOptional()
  @IsString()
  givenName?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Doe',
    description: 'Family name.',
  })
  @IsOptional()
  @IsString()
  familyName?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'https://example.com/avatar.png',
    description: 'Profile picture URL.',
  })
  @IsOptional()
  @IsUrl()
  picture?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'en',
    description: 'Preferred locale.',
  })
  @IsOptional()
  @IsString()
  locale?: string;
}