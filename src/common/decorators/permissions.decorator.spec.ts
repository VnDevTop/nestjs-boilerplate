import { describe, expect, it } from 'vitest';

import { PERMISSIONS_KEY, Permissions } from './permissions.decorator.js';
import { Permission } from '../enums/permission.enum.js';

describe('Permissions decorator', () => {
  it('should export PERMISSIONS_KEY as "permissions"', () => {
    expect(PERMISSIONS_KEY).toBe('permissions');
  });

  it('should create metadata with single permission', () => {
    const decorator = Permissions(Permission.USERS_READ);
    expect(decorator).toBeDefined();
    expect(typeof decorator).toBe('function');
  });

  it('should create metadata with multiple permissions', () => {
    const decorator = Permissions(Permission.USERS_READ, Permission.USERS_WRITE);
    expect(decorator).toBeDefined();
    expect(typeof decorator).toBe('function');
  });

  it('should create metadata with no permissions', () => {
    const decorator = Permissions();
    expect(decorator).toBeDefined();
    expect(typeof decorator).toBe('function');
  });
});