/**
 * Lifecycle status of a user account.
 *
 * @enum UserStatus
 */
export enum UserStatus {
  /** Account is active and can authenticate. */
  ACTIVE = 'ACTIVE',
  /** Account is inactive (not yet activated or disabled). */
  INACTIVE = 'INACTIVE',
  /** Account is suspended (e.g. by an administrator). */
  SUSPENDED = 'SUSPENDED',
  /** Account has been soft-deleted. */
  DELETED = 'DELETED',
}