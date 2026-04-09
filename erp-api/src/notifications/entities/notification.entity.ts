import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum NotificationType {
  INFO = 'INFO',
  ALERT = 'ALERT',
  SUCCESS = 'SUCCESS',
}

export enum NotificationCategory {
  PRODUCTION_ASSIGNED = 'PRODUCTION_ASSIGNED',
  PRODUCTION_COMPLETED = 'PRODUCTION_COMPLETED',
  GENERAL = 'GENERAL',
}

@Entity('app_notifications')
export class AppNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** The user who should see the notification */
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    enumName: 'notification_type_enum',
    default: NotificationType.INFO,
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationCategory,
    enumName: 'notification_category_enum',
    default: NotificationCategory.GENERAL,
  })
  category: NotificationCategory;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  /** Optional reference to a related entity (e.g. taskId or assignmentId) */
  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
