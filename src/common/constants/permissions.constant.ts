import { Permission } from '../enums/permission.enum.js';
import { Role } from '../enums/role.enum.js';

/**
 * Maps each role to its granted permissions.
 *
 * Used by the PermissionsGuard to check whether a user's roles
 * include the required permission.
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.USERS_READ,
    Permission.USERS_WRITE,
    Permission.USERS_DELETE,
    Permission.USERS_MANAGE_ROLES,
    Permission.ROLES_READ,
    Permission.ROLES_WRITE,
    Permission.ADMIN_ACCESS,
    Permission.ADMIN_MANAGE,
    Permission.AUTH_MANAGE,
  ],
  [Role.MANAGER]: [
    Permission.USERS_READ,
    Permission.USERS_WRITE,
    Permission.ROLES_READ,
  ],
  [Role.USER]: [
    Permission.USERS_READ,
  ],
};

/**
 * Resolves the set of permissions granted to a user based on their roles.
 *
 * @param roles - User roles.
 * @returns Array of granted permissions (deduplicated).
 */
export function resolvePermissions(roles: (Role | string)[]): Permission[] {
  const permissions = new Set<Permission>();
  for (const role of roles) {
    const rolePermissions = ROLE_PERMISSIONS[role as Role];
    if (rolePermissions) {
      for (const permission of rolePermissions) {
        permissions.add(permission);
      }
    }
  }
  return Array.from(permissions);
}