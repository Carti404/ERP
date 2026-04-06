import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMessageImportance1775500336532 implements MigrationInterface {
    name = 'AddMessageImportance1775500336532'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "internal_messages" ADD "importance" character varying(20) NOT NULL DEFAULT 'LOW'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "internal_messages" DROP COLUMN "importance"`);
    }

}
