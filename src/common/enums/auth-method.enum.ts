/**
 * Authentication methods supported by the system.
 *
 * @enum AuthMethod
 */
export enum AuthMethod {
  /** Email/password authentication. */
  PASSWORD = 'PASSWORD',
  /** OpenID Connect / OAuth2 provider authentication. */
  OIDC = 'OIDC',
  /** Multi-factor authentication (TOTP, etc.). */
  MFA = 'MFA',
  /** Magic link / email passcode authentication. */
  MAGIC_LINK = 'MAGIC_LINK',
  /** API key authentication. */
  API_KEY = 'API_KEY',
}