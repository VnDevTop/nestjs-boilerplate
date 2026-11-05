import { OidcProvider } from './oidc-provider.enum.js';

describe('OidcProvider', () => {
  it('should define supported OIDC providers', () => {
    expect(OidcProvider.GOOGLE).toBe('GOOGLE');
    expect(OidcProvider.MICROSOFT).toBe('MICROSOFT');
    expect(OidcProvider.GITHUB).toBe('GITHUB');
    expect(OidcProvider.APPLE).toBe('APPLE');
    expect(OidcProvider.FACEBOOK).toBe('FACEBOOK');
    expect(OidcProvider.X).toBe('X');
  });
});
