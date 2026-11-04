import { registerAs } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Database (TypeORM + PostgreSQL) configuration namespace.
 */
export const databaseConfig = registerAs<TypeOrmModuleOptions>(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    autoLoadEntities: true,
    synchronize: process.env.NODE_ENV === 'test',
    ssl:
      process.env.DB_SSL === 'true'
        ? {
            rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
          }
        : undefined,
  })
);