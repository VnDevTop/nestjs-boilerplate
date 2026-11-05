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
  /** Issued token pair. Absent when MFA verification is pending. */
  tokens?: TokenPair;
  /** Whether the user must complete MFA verification before tokens are issued. */
  mfaRequired?: boolean;
  /** Pending MFA challenge token (JWT) when `mfaRequired` is true. */
  mfaToken?: string;
}