import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { LeaveRequestHistory } from './leave-request-history.entity';

export enum LeaveRequestType {
  VACATION = 'VACATION',
  LATENESS = 'LATENESS',
  ABSENCE = 'ABSENCE',
  PERSONAL = 'PERSONAL',
  MEDICAL = 'MEDICAL',
}

export enum LeaveRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ADMIN_PROPOSAL = 'ADMIN_PROPOSAL',
  WORKER_APPEAL = 'WORKER_APPEAL',
}

@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: LeaveRequestType, enumName: 'leave_request_type_enum' })
  type: LeaveRequestType;

  @Column({ type: 'enum', enum: LeaveRequestStatus, enumName: 'leave_request_status_enum', default: LeaveRequestStatus.PENDING })
  status: LeaveRequestStatus;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'total_days', type: 'int' })
  totalDays: number;

  @Column({ type: 'jsonb', nullable: true })
  segments: { start: string, end: string, count: number }[];

  @Column({ type: 'text' })
  reason: string;

  @Column({ name: 'evidence_url', type: 'varchar', length: 500, nullable: true })
  evidenceUrl: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => LeaveRequestHistory, (h) => h.leaveRequest)
  history: LeaveRequestHistory[];
}
