import { MigrationInterface, QueryRunner } from 'typeorm';

export class SystemParameters1744000000000 implements MigrationInterface {
  name = 'SystemParameters1744000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "work_schedule_blocks" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "block_key" character varying(20) NOT NULL,
        "start_time" character varying(5) NOT NULL,
        "end_time" character varying(5) NOT NULL,
        "tolerance_minutes" integer NOT NULL DEFAULT 0,
        "active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "UQ_work_schedule_blocks_key" UNIQUE ("block_key"),
        CONSTRAINT "PK_work_schedule_blocks" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "plant_rest_settings" (
        "id" smallint NOT NULL,
        "snack_nominal_minutes" integer NOT NULL,
        "lunch_from_time" character varying(5) NOT NULL,
        "lunch_duration_minutes" integer NOT NULL,
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_plant_rest_settings" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_plant_rest_settings_singleton" CHECK ("id" = 1)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "holidays" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "holiday_date" date NOT NULL,
        "title" character varying(200) NOT NULL,
        "description" character varying(500),
        CONSTRAINT "UQ_holidays_date" UNIQUE ("holiday_date"),
        CONSTRAINT "PK_holidays" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "work_schedule_blocks" ("block_key", "start_time", "end_time", "tolerance_minutes", "active")
      SELECT 'mon_fri', '08:00', '17:00', 15, true
      WHERE NOT EXISTS (SELECT 1 FROM "work_schedule_blocks" WHERE "block_key" = 'mon_fri')
    `);
    await queryRunner.query(`
      INSERT INTO "work_schedule_blocks" ("block_key", "start_time", "end_time", "tolerance_minutes", "active")
      SELECT 'saturday', '08:00', '13:00', 10, true
      WHERE NOT EXISTS (SELECT 1 FROM "work_schedule_blocks" WHERE "block_key" = 'saturday')
    `);

    await queryRunner.query(`
      INSERT INTO "plant_rest_settings" ("id", "snack_nominal_minutes", "lunch_from_time", "lunch_duration_minutes")
      SELECT 1, 20, '12:00', 60
      WHERE NOT EXISTS (SELECT 1 FROM "plant_rest_settings" WHERE "id" = 1)
    `);

    // No insertamos festivos por defecto para permitir gestión manual total.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "holidays"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "plant_rest_settings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "work_schedule_blocks"`);
  }
}
