/**
 * Pair of access and refresh tokens issued after authentication.
 *
 * @interface TokenPair
 */
export interface TokenPair {
  /** Short-lived access token. */
  accessToken: string;
  /** Long-lived refresh token. */
  refreshToken: string;
  /** Access token lifetime in seconds. */
  expiresIn?: number;
  /** Token type (e.g. Bearer). */
  tokenType?: string;
}