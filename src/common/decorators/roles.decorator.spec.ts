import { describe, expect, it } from 'vitest';

import { ROLES_KEY, Roles } from './roles.decorator.js';
import { Role } from '../enums/role.enum.js';

describe('Roles decorator', () => {
  it('should export ROLES_KEY as "roles"', () => {
    expect(ROLES_KEY).toBe('roles');
  });

  it('should create metadata with single role', () => {
    const decorator = Roles(Role.ADMIN);
    expect(decorator).toBeDefined();
    expect(typeof decorator).toBe('function');
  });

  it('should create metadata with multiple roles', () => {
    const decorator = Roles(Role.ADMIN, Role.MANAGER);
    expect(decorator).toBeDefined();
    expect(typeof decorator).toBe('function');
  });

  it('should create metadata with no roles', () => {
    const decorator = Roles();
    expect(decorator).toBeDefined();
    expect(typeof decorator).toBe('function');
  });

  it('should create metadata with all roles', () => {
    const decorator = Roles(Role.ADMIN, Role.MANAGER, Role.USER);
    expect(decorator).toBeDefined();
    expect(typeof decorator).toBe('function');
  });
});