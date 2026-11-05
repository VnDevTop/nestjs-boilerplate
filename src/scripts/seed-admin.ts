import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';

import { User } from '../modules/users/entities/user.entity.js';
import { Role } from '../common/enums/role.enum.js';
import { UserStatus } from '../common/enums/user-status.enum.js';

/**
 * Standalone database seeding script.
 *
 * Creates an initial admin user that can be used to exercise
 * administrative endpoints locally and in CI (e2e) environments.
 *
 * Usage:
 * - `npm run seed` (after `npm run build`)
 * - Env vars: `SEED_ADMIN_EMAIL` (default: admin@example.com),
 *            `SEED_ADMIN_PASSWORD` (default: admin123)
 */

async function seedAdmin(): Promise<void> {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [User],
    synchronize: true,
  });

  await dataSource.initialize();

  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';

  const existingUser = await dataSource.getRepository(User).findOne({ where: { email } });
  if (!existingUser) {
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    await dataSource.getRepository(User).save(
      dataSource.getRepository(User).create({
        email,
        sub: email,
        passwordHash,
        emailVerified: true,
        name: 'Admin',
        roles: [Role.ADMIN],
        status: UserStatus.ACTIVE,
      }),
    );

    console.log(`Seeded admin user: ${email}`);
  }

  await dataSource.destroy();
}

seedAdmin().catch((error) => {
  console.error('Failed to seed admin user:', error);
  process.exit(1);
});
