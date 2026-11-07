import { Role } from '../enums/role.enum.js';

/**
 * Authenticated user attached to an incoming request.
 *
 * @interface RequestUser
 */
export interface RequestUser {
  /** Subject identifier (user id). */
  sub: string;
  /** User email address. */
  email?: string;
  /** Roles granted to the user. */
  roles?: Role[] | string[];
  /** Whether the email has been verified. */
  emailVerified?: boolean;
  /** Whether the user completed multi-factor authentication (MFA). */
  mfaVerified?: boolean;
  /** Display name. */
  name?: string;
}