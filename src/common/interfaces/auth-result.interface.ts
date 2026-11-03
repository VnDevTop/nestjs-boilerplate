import { RequestUser } from './request-user.interface.js';
import { TokenPair } from './token-pair.interface.js';

/**
 * Result of a successful authentication flow.
 *
 * @interface AuthResult
 */
export interface AuthResult {
  /** Authenticated user. */
  user: RequestUser;
  /** Issued token pair. */
  tokens: TokenPair;
}