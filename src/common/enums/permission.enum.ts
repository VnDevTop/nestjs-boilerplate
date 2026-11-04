/**
 * Granular permissions for fine-grained access control.
 *
 * Permissions are more granular than roles and allow precise
 * control over what actions a user can perform.
 *
 * @enum Permission
 */
export enum Permission {
  // User management
  USERS_READ = 'users:read',
  USERS_WRITE = 'users:write',
  USERS_DELETE = 'users:delete',
  USERS_MANAGE_ROLES = 'users:manage_roles',

  // Role management
  ROLES_READ = 'roles:read',
  ROLES_WRITE = 'roles:write',

  // Admin
  ADMIN_ACCESS = 'admin:access',
  ADMIN_MANAGE = 'admin:manage',

  // Auth
  AUTH_MANAGE = 'auth:manage',
}