import { Permission } from './permission.enum.js';

describe('Permission', () => {
  it('should define permissions', () => {
    expect(Permission.USERS_READ).toBe('users:read');
    expect(Permission.USERS_WRITE).toBe('users:write');
    expect(Permission.USERS_DELETE).toBe('users:delete');
    expect(Permission.USERS_MANAGE_ROLES).toBe('users:manage_roles');
    expect(Permission.ROLES_READ).toBe('roles:read');
    expect(Permission.ROLES_WRITE).toBe('roles:write');
    expect(Permission.ADMIN_ACCESS).toBe('admin:access');
    expect(Permission.ADMIN_MANAGE).toBe('admin:manage');
    expect(Permission.AUTH_MANAGE).toBe('auth:manage');
  });
});
