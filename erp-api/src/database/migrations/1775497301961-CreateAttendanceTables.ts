import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAttendanceTables1775497301961 implements MigrationInterface {
    name = 'CreateAttendanceTables1775497301961'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "internal_messages" DROP CONSTRAINT "FK_internal_messages_sender"`);
        await queryRunner.query(`ALTER TABLE "internal_messages" DROP CONSTRAINT "FK_internal_messages_recipient"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_internal_messages_recipient_created"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_internal_messages_sender_created"`);
        await queryRunner.query(`ALTER TABLE "plant_rest_settings" DROP CONSTRAINT "CHK_plant_rest_settings_singleton"`);
        await queryRunner.query(`CREATE TABLE "attendance_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "work_date" date NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'En_Proceso', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_946920332f5bc9efad3f3023b96" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."attendance_event_type_enum" AS ENUM('CLOCK_IN', 'CLOCK_OUT', 'BREAK_START', 'BREAK_END', 'MEAL_START', 'MEAL_END')`);
        await queryRunner.query(`CREATE TABLE "attendance_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "attendance_record_id" uuid NOT NULL, "eventType" "public"."attendance_event_type_enum" NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e78c28cf950bd06d614ae09f26b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "holidays" DROP CONSTRAINT "UQ_holidays_date"`);
        await queryRunner.query(`ALTER TABLE "work_schedule_blocks" ALTER COLUMN "tolerance_minutes" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "internal_messages" ADD CONSTRAINT "FK_343badf2933b46affc0a4a918ab" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "internal_messages" ADD CONSTRAINT "FK_3a31f671deeee9a56a57eb6adaf" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance_records" ADD CONSTRAINT "FK_10e9fc7100cb48ace47a91ee1ce" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance_logs" ADD CONSTRAINT "FK_7c839aaab049706b46ca3e50939" FOREIGN KEY ("attendance_record_id") REFERENCES "attendance_records"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance_logs" DROP CONSTRAINT "FK_7c839aaab049706b46ca3e50939"`);
        await queryRunner.query(`ALTER TABLE "attendance_records" DROP CONSTRAINT "FK_10e9fc7100cb48ace47a91ee1ce"`);
        await queryRunner.query(`ALTER TABLE "internal_messages" DROP CONSTRAINT "FK_3a31f671deeee9a56a57eb6adaf"`);
        await queryRunner.query(`ALTER TABLE "internal_messages" DROP CONSTRAINT "FK_343badf2933b46affc0a4a918ab"`);
        await queryRunner.query(`ALTER TABLE "work_schedule_blocks" ALTER COLUMN "tolerance_minutes" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "holidays" ADD CONSTRAINT "UQ_holidays_date" UNIQUE ("holiday_date")`);
        await queryRunner.query(`DROP TABLE "attendance_logs"`);
        await queryRunner.query(`DROP TYPE "public"."attendance_event_type_enum"`);
        await queryRunner.query(`DROP TABLE "attendance_records"`);
        await queryRunner.query(`ALTER TABLE "plant_rest_settings" ADD CONSTRAINT "CHK_plant_rest_settings_singleton" CHECK ((id = 1))`);
        await queryRunner.query(`CREATE INDEX "IDX_internal_messages_sender_created" ON "internal_messages" ("sender_id", "created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_internal_messages_recipient_created" ON "internal_messages" ("recipient_id", "created_at") `);
        await queryRunner.query(`ALTER TABLE "internal_messages" ADD CONSTRAINT "FK_internal_messages_recipient" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "internal_messages" ADD CONSTRAINT "FK_internal_messages_sender" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
