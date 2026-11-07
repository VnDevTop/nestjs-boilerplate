import { AuthMethod } from './auth-method.enum.js';

describe('AuthMethod', () => {
  it('should define auth methods', () => {
    expect(AuthMethod.PASSWORD).toBe('PASSWORD');
    expect(AuthMethod.OIDC).toBe('OIDC');
    expect(AuthMethod.MFA).toBe('MFA');
    expect(AuthMethod.MAGIC_LINK).toBe('MAGIC_LINK');
    expect(AuthMethod.PASSCODE).toBe('PASSCODE');
    expect(AuthMethod.API_KEY).toBe('API_KEY');
  });
});
