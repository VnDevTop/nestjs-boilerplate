import { AuthMethod } from '../enums/auth-method.enum.js';
import { Role } from '../enums/role.enum.js';

/**
 * Payload encoded inside a JSON Web Token (JWT).
 *
 * @interface JwtPayload
 */
export interface JwtPayload {
  /** Subject identifier (user id). */
  sub: string;
  /** User email address. */
  email?: string;
  /** Roles granted to the user. */
  roles?: Role[] | string[];
  /** Issued-at timestamp (seconds since epoch). */
  iat?: number;
  /** Expiration timestamp (seconds since epoch). */
  exp?: number;
  /** JWT ID. */
  jti?: string;
  /** Token type. */
  type?: string;
  /** Whether the user completed multi-factor authentication (MFA). */
  mfaVerified?: boolean;
  /** The authentication method used to issue the token (e.g. PASSWORD, OIDC, MFA). */
  authMethod?: AuthMethod;
}