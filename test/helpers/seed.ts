import { TestingModule } from '@nestjs/testing';

import { AuthService } from '../../src/modules/auth/auth.service.js';
import { TokenPair } from '../../src/common/interfaces/token-pair.interface.js';
import { UsersService } from '../../src/modules/users/users.service.js';
import { UserRepository } from '../../src/modules/users/repositories/user.repository.js';
import { Role } from '../../src/common/enums/role.enum.js';

/**
 * Credentials for seeding a user through the real registration flow.
 */
export interface SeedUserCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface SeededUser {
  userId: string;
  tokens: TokenPair;
}

/**
 * Seeds a user through the real registration flow and optionally assigns roles.
 *
 * The user is created through `AuthService.register` (so the full flow —
 * hashing, persistence, token issuance — is exercised) and, when roles are
 * provided, promoted via `UsersService.changeRoles` followed by a re-issue of
 * tokens so the returned access token reflects the new roles.
 *
 * @param moduleFixture - The compiled testing module (must already be initialized).
 * @param credentials - Registration credentials (email, password, optional name).
 * @param roles - Roles to assign. Defaults to no change (user keeps `[USER]`).
 * @returns The seeded user id and its token pair.
 */
export async function seedUser(
  moduleFixture: TestingModule,
  credentials: SeedUserCredentials,
  roles: string[] = [],
): Promise<SeededUser> {
  const authService = moduleFixture.get<AuthService>(AuthService);
  const usersService = moduleFixture.get<UsersService>(UsersService);

  const result = await authService.register(credentials.email, credentials.password, credentials.name);
  const userId = result.user.sub;

  let tokens = result.tokens;
  if (roles.length > 0 && roles[0] !== Role.USER) {
    await usersService.changeRoles(userId, roles);
    tokens = (await authService.login(credentials.email, credentials.password)).tokens;
  }

  return { userId, tokens: tokens as TokenPair };
}

/**
 * Soft-deletes a previously seeded user so e2e suites do not leak rows into
 * the shared test database.
 *
 * @param moduleFixture - The compiled testing module (must already be initialized).
 * @param userId - Id of the user to clean up.
 * @returns Promise that resolves once the user has been soft-deleted.
 */
export async function cleanupUser(moduleFixture: TestingModule, userId: string): Promise<void> {
  const userRepository = moduleFixture.get<UserRepository>(UserRepository);
  await userRepository.softDelete(userId);
}
