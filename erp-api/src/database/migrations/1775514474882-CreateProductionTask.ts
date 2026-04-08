import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductionTask1775514474882 implements MigrationInterface {
    name = 'CreateProductionTask1775514474882'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "production_tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "external_mt_id" character varying NOT NULL, "order_number" character varying, "product_id" character varying, "product_name" character varying NOT NULL, "quantity_to_produce" numeric NOT NULL, "recipe" jsonb, "assigned_worker_id" uuid, "status" character varying NOT NULL DEFAULT 'DRAFT', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c1344697865b337312ff2cd5155" UNIQUE ("external_mt_id"), CONSTRAINT "PK_2e650b46a4eb798dbb97b61973e" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "production_tasks"`);
    }

}
