import { SetMetadata } from '@nestjs/common';

import { Role } from '../enums/role.enum.js';

/**
 * Metadata key for required roles.
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator to require one or more roles for a route.
 *
 * @param roles - Required roles.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);