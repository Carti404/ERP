import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProcessTrackingPause1775900000000 implements MigrationInterface {
  name = 'AddProcessTrackingPause1775900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "production_process_tracking"
      ADD COLUMN IF NOT EXISTS "paused_at" TIMESTAMPTZ
    `);

    await queryRunner.query(`
      ALTER TABLE "production_process_tracking"
      ADD COLUMN IF NOT EXISTS "accumulated_paused_seconds" integer NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "production_process_tracking"
      DROP COLUMN IF EXISTS "accumulated_paused_seconds"
    `);

    await queryRunner.query(`
      ALTER TABLE "production_process_tracking"
      DROP COLUMN IF EXISTS "paused_at"
    `);
  }
}
