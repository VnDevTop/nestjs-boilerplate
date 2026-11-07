import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeviceAuthorizations1791379200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Device authorization storage for the OAuth2 device authorization grant.
    await queryRunner.query(
      `CREATE TABLE "device_authorizations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "deviceCode" character varying(255) NOT NULL,
        "userCode" character varying(32) NOT NULL,
        "clientId" character varying(255) NOT NULL,
        "userId" character varying(255),
        "status" character varying(32) NOT NULL DEFAULT 'PENDING',
        "scopes" character varying(255),
        "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT "PK_device_authorizations" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_device_authorizations_deviceCode" ON "device_authorizations" ("deviceCode")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_device_authorizations_userCode" ON "device_authorizations" ("userCode")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "device_authorizations"`);
  }
}
