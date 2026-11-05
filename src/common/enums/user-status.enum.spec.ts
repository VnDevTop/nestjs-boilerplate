import { UserStatus } from './user-status.enum.js';

describe('UserStatus', () => {
  it('should define user statuses', () => {
    expect(UserStatus.ACTIVE).toBe('ACTIVE');
    expect(UserStatus.INACTIVE).toBe('INACTIVE');
    expect(UserStatus.SUSPENDED).toBe('SUSPENDED');
    expect(UserStatus.DELETED).toBe('DELETED');
  });
});
