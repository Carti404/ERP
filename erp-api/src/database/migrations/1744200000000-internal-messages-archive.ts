import { MigrationInterface, QueryRunner } from 'typeorm';

export class InternalMessagesArchive1744200000000 implements MigrationInterface {
  name = 'InternalMessagesArchive1744200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "internal_messages" ADD "archived_at_sender" TIMESTAMPTZ`,
    );
    await queryRunner.query(
      `ALTER TABLE "internal_messages" ADD "archived_at_recipient" TIMESTAMPTZ`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "internal_messages" DROP COLUMN "archived_at_recipient"`,
    );
    await queryRunner.query(
      `ALTER TABLE "internal_messages" DROP COLUMN "archived_at_sender"`,
    );
  }
}
