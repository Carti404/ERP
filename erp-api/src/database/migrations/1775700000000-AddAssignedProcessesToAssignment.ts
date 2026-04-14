import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAssignedProcessesToAssignment1775700000000 implements MigrationInterface {
    name = 'AddAssignedProcessesToAssignment1775700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "production_assignments" ADD "assigned_process_ids" jsonb NOT NULL DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "production_assignments" DROP COLUMN "assigned_process_ids"`);
    }
}
