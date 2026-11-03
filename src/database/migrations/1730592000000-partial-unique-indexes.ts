import { MigrationInterface, QueryRunner } from 'typeorm';

export class PartialUniqueIndexes1730592000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create partial unique index on 'sub' where deletedAt IS NULL
    // This allows reusing sub/email after soft delete while preventing duplicates among active users
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_USERS_SUB_ACTIVE" ON "users" ("sub") WHERE "deletedAt" IS NULL`
    );

    // Create partial unique index on 'email' where deletedAt IS NULL
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_USERS_EMAIL_ACTIVE" ON "users" ("email") WHERE "deletedAt" IS NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the partial unique indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_USERS_SUB_ACTIVE"`
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_USERS_EMAIL_ACTIVE"`
    );
  }
}