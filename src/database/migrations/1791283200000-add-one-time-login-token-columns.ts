import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOneTimeLoginTokenColumns1791283200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Hashed one-time login token (magic link token or email passcode).
    await queryRunner.query(`ALTER TABLE "users" ADD "loginTokenHash" character varying(255)`);

    // Expiry timestamp for the one-time login token.
    await queryRunner.query(`ALTER TABLE "users" ADD "loginTokenExpiresAt" TIMESTAMP WITH TIME ZONE`);

    // Whether the one-time login token has been consumed (single-use).
    await queryRunner.query(`ALTER TABLE "users" ADD "loginTokenConsumed" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "loginTokenConsumed"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "loginTokenExpiresAt"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "loginTokenHash"`);
  }
}
