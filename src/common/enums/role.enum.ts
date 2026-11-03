/**
 * Shared role values used across the application for authorization.
 *
 * @enum Role
 */
export enum Role {
  /** Full administrative access. */
  ADMIN = 'ADMIN',
  /** Manager-level access. */
  MANAGER = 'MANAGER',
  /** Standard end-user access. */
  USER = 'USER',
}