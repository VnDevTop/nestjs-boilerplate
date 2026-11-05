import { Permission } from '../enums/permission.enum.js';
import { Role } from '../enums/role.enum.js';
import { resolvePermissions, ROLE_PERMISSIONS } from './permissions.constant.js';

describe('permissions constant', () => {
  it('should resolve permissions for admin role', () => {
    const permissions = resolvePermissions([Role.ADMIN]);

    expect(permissions).toContain(Permission.USERS_READ);
    expect(permissions).toContain(Permission.USERS_WRITE);
    expect(permissions).toContain(Permission.AUTH_MANAGE);
  });

  it('should resolve permissions for manager role', () => {
    const permissions = resolvePermissions([Role.MANAGER]);

    expect(permissions).toContain(Permission.USERS_READ);
    expect(permissions).toContain(Permission.ROLES_READ);
  });

  it('should resolve permissions for user role', () => {
    const permissions = resolvePermissions([Role.USER]);

    expect(permissions).toContain(Permission.USERS_READ);
    expect(permissions).not.toContain(Permission.USERS_WRITE);
  });

  it('should return empty array for unknown role', () => {
    expect(resolvePermissions(['UNKNOWN' as Role])).toEqual([]);
  });

  it('should deduplicate permissions across multiple roles', () => {
    const permissions = resolvePermissions([Role.USER, Role.MANAGER]);

    expect(permissions).toContain(Permission.USERS_READ);
    expect(permissions).toContain(Permission.ROLES_READ);
    expect(permissions).toHaveLength(3);
  });

  it('should define permissions for all known roles', () => {
    expect(ROLE_PERMISSIONS[Role.ADMIN].length).toBeGreaterThan(0);
    expect(ROLE_PERMISSIONS[Role.MANAGER].length).toBeGreaterThan(0);
    expect(ROLE_PERMISSIONS[Role.USER].length).toBeGreaterThan(0);
  });
});
