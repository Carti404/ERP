import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { InternalMessage } from './internal-message.entity';

@Entity('internal_message_attachments')
export class InternalMessageAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'message_id', type: 'uuid', nullable: true })
  messageId: string | null;

  @ManyToOne(() => InternalMessage, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  message: InternalMessage;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'varchar', length: 100 })
  mimetype: string;

  @Column({ type: 'integer' })
  size: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
