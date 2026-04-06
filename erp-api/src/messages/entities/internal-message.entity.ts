import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

export enum MessageImportance {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

@Entity('internal_messages')
export class InternalMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sender_id', type: 'uuid' })
  senderId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ name: 'recipient_id', type: 'uuid' })
  recipientId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @Column({ type: 'varchar', length: 500 })
  subject: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt: Date | null;

  @Column({ name: 'archived_at_sender', type: 'timestamptz', nullable: true })
  archivedAtSender: Date | null;

  @Column({ name: 'archived_at_recipient', type: 'timestamptz', nullable: true })
  archivedAtRecipient: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'varchar', length: 20, default: MessageImportance.LOW })
  importance: MessageImportance;
}
