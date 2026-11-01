import { registerAs } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Database (TypeORM + PostgreSQL) configuration namespace.
 */
export const databaseConfig = registerAs<TypeOrmModuleOptions>(
  'database',
  (): TypeOrmModuleOptions => ({
    url: process.env.DATABASE_URL,
    autoLoadEntities: true,
    synchronize: false,
  })
);