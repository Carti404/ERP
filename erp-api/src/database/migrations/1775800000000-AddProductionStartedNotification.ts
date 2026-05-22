import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductionStartedNotification1775800000000 implements MigrationInterface {
  name = 'AddProductionStartedNotification1775800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "notification_category_enum" ADD VALUE IF NOT EXISTS 'PRODUCTION_STARTED';
    `);
  }

  public async down(): Promise<void> {
    // PostgreSQL no permite eliminar valores de enum de forma segura sin recrear el tipo.
  }
}
