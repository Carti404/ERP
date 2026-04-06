import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1743888000000 implements MigrationInterface {
  name = 'CreateUsers1743888000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "user_role_enum" AS ENUM ('admin', 'worker')`,
    );
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "username" character varying(64) NOT NULL,
        "email" character varying(255),
        "pin_hash" character varying(72) NOT NULL,
        "role" "user_role_enum" NOT NULL,
        "full_name" character varying(200) NOT NULL,
        "puesto" character varying(120),
        "activo" boolean NOT NULL DEFAULT true,
        "inactivo_desde" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
