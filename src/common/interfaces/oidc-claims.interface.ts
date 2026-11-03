/**
 * Standard OpenID Connect claims returned by an identity provider.
 *
 * @interface OidcClaims
 */
export interface OidcClaims {
  /** Subject identifier. */
  sub: string;
  /** Email address. */
  email?: string;
  /** Whether the email has been verified. */
  email_verified?: boolean;
  /** Full name. */
  name?: string;
  /** Given name. */
  given_name?: string;
  /** Family name. */
  family_name?: string;
  /** Profile picture URL. */
  picture?: string;
  /** Locale. */
  locale?: string;
  /** Issuer. */
  iss?: string;
  /** Audience. */
  aud?: string | string[];
  /** Expiration time. */
  exp?: number;
  /** Issued at. */
  iat?: number;
}