import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { LeaveRequest } from './leave-request.entity';

export enum LeaveRequestActionType {
  CREATED = 'CREATED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ADMIN_PROPOSAL = 'ADMIN_PROPOSAL',
  WORKER_APPEAL = 'WORKER_APPEAL',
}

@Entity('leave_request_history')
export class LeaveRequestHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'leave_request_id', type: 'uuid' })
  leaveRequestId: string;

  @ManyToOne(() => LeaveRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leave_request_id' })
  leaveRequest: LeaveRequest;

  @Column({ name: 'author_id', type: 'uuid' })
  authorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ type: 'enum', enum: LeaveRequestActionType, enumName: 'leave_request_action_enum' })
  actionType: LeaveRequestActionType;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'proposed_start_date', type: 'date', nullable: true })
  proposedStartDate: Date | null;

  @Column({ name: 'proposed_end_date', type: 'date', nullable: true })
  proposedEndDate: Date | null;

  @Column({ name: 'proposed_segments', type: 'jsonb', nullable: true })
  proposedSegments: { start: string, end: string, count: number }[] | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
