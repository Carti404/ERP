import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { AttendanceRecord } from './attendance-record.entity';
import { AttendanceEventType } from '../../common/enums/attendance-event-type.enum';

@Entity('attendance_logs')
export class AttendanceLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AttendanceRecord, (record) => record.logs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'attendance_record_id' })
  attendanceRecord: AttendanceRecord;

  @Column({ name: 'attendance_record_id' })
  attendanceRecordId: string;

  @Column({ type: 'enum', enum: AttendanceEventType, enumName: 'attendance_event_type_enum' })
  eventType: AttendanceEventType;

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
