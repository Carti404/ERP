import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProcessRecipeItems1775800000000 implements MigrationInterface {
  name = 'AddProcessRecipeItems1775800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "production_processes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "task_id" uuid NOT NULL,
        "order_index" integer NOT NULL,
        "name" character varying(200) NOT NULL,
        "description" text,
        "estimated_time_value" integer NOT NULL DEFAULT 0,
        "estimated_time_unit" character varying(20) NOT NULL DEFAULT 'minutes',
        "recipe_items" jsonb NOT NULL DEFAULT '[]',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_production_processes" PRIMARY KEY ("id"),
        CONSTRAINT "FK_production_processes_task" FOREIGN KEY ("task_id")
          REFERENCES "production_tasks"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_process_templates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "product_id" character varying NOT NULL,
        "product_name" character varying,
        "order_index" integer NOT NULL,
        "name" character varying(200) NOT NULL,
        "description" text,
        "estimated_time_value" integer NOT NULL DEFAULT 0,
        "estimated_time_unit" character varying(20) NOT NULL DEFAULT 'minutes',
        "total_estimated_time_value" integer NOT NULL DEFAULT 0,
        "total_estimated_time_unit" character varying(20) NOT NULL DEFAULT 'minutes',
        "recipe_items" jsonb NOT NULL DEFAULT '[]',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_process_templates" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "production_tasks"
      ADD COLUMN IF NOT EXISTS "total_estimated_time_value" integer NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      ALTER TABLE "production_tasks"
      ADD COLUMN IF NOT EXISTS "total_estimated_time_unit" character varying(20) NOT NULL DEFAULT 'minutes'
    `);

    await queryRunner.query(`
      ALTER TABLE "production_processes"
      ADD COLUMN IF NOT EXISTS "recipe_items" jsonb NOT NULL DEFAULT '[]'
    `);

    await queryRunner.query(`
      ALTER TABLE "product_process_templates"
      ADD COLUMN IF NOT EXISTS "recipe_items" jsonb NOT NULL DEFAULT '[]'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "product_process_templates" DROP COLUMN IF EXISTS "recipe_items"
    `);
    await queryRunner.query(`
      ALTER TABLE "production_processes" DROP COLUMN IF EXISTS "recipe_items"
    `);
  }
}
