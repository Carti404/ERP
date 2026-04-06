import { MigrationInterface, QueryRunner } from 'typeorm';

export class InternalMessages1744100000000 implements MigrationInterface {
  name = 'InternalMessages1744100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "internal_messages" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "sender_id" uuid NOT NULL,
        "recipient_id" uuid NOT NULL,
        "subject" character varying(500) NOT NULL,
        "body" text NOT NULL,
        "read_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_internal_messages" PRIMARY KEY ("id"),
        CONSTRAINT "FK_internal_messages_sender" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_internal_messages_recipient" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_internal_messages_recipient_created" ON "internal_messages" ("recipient_id", "created_at" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_internal_messages_sender_created" ON "internal_messages" ("sender_id", "created_at" DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "internal_messages"`);
  }
}
