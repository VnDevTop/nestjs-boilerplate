import { SetMetadata } from '@nestjs/common';

import { Permission } from '../enums/permission.enum.js';

/**
 * Metadata key for required permissions.
 */
export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to require one or more permissions for a route.
 *
 * @param permissions - Required permissions.
 */
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);