import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTotpColumns1730678400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add TOTP secret column (nullable, selected only via explicit queries)
    await queryRunner.query(`ALTER TABLE "users" ADD "totpSecret" character varying(255)`);

    // Add TOTP enabled flag (defaults to false)
    await queryRunner.query(`ALTER TABLE "users" ADD "totpEnabled" boolean NOT NULL DEFAULT false`);

    // Add backup codes column (nullable, simple-array of hashed codes)
    await queryRunner.query(`ALTER TABLE "users" ADD "backupCodes" character varying(255)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "backupCodes"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "totpEnabled"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "totpSecret"`);
  }
}
