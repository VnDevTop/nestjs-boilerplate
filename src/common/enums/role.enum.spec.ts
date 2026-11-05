import { Role } from './role.enum.js';

describe('Role', () => {
  it('should define roles', () => {
    expect(Role.ADMIN).toBe('ADMIN');
    expect(Role.MANAGER).toBe('MANAGER');
    expect(Role.USER).toBe('USER');
  });
});
