/**
 * Types of tokens issued and validated by the authentication system.
 *
 * @enum TokenType
 */
export enum TokenType {
  /** Short-lived access token. */
  ACCESS = 'ACCESS',
  /** Long-lived refresh token. */
  REFRESH = 'REFRESH',
  /** ID token carrying OIDC claims. */
  ID = 'ID',
  /** API key token for machine-to-machine access. */
  API_KEY = 'API_KEY',
}