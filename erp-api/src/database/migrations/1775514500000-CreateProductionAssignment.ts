import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductionAssignment1775514500000 implements MigrationInterface {
    name = 'CreateProductionAssignment1775514500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "production_assignments" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "task_id" uuid NOT NULL, 
            "worker_id" uuid NOT NULL, 
            "quantity" numeric(10,2) NOT NULL, 
            "status" character varying NOT NULL DEFAULT 'ASSIGNED', 
            "started_at" TIMESTAMP WITH TIME ZONE, 
            "completed_at" TIMESTAMP WITH TIME ZONE, 
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_production_assignments" PRIMARY KEY ("id")
        )`);
        
        await queryRunner.query(`ALTER TABLE "production_assignments" ADD CONSTRAINT "FK_task" FOREIGN KEY ("task_id") REFERENCES "production_tasks"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "production_assignments" ADD CONSTRAINT "FK_worker" FOREIGN KEY ("worker_id") REFERENCES "users"("id") ON DELETE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "production_assignments" DROP CONSTRAINT "FK_worker"`);
        await queryRunner.query(`ALTER TABLE "production_assignments" DROP CONSTRAINT "FK_task"`);
        await queryRunner.query(`DROP TABLE "production_assignments"`);
    }
}
