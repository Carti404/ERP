import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AppNotification,
  NotificationType,
  NotificationCategory,
} from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(AppNotification)
    private readonly notifRepo: Repository<AppNotification>,
  ) {}

  /** Create a new notification for a specific user */
  async create(data: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    category?: NotificationCategory;
    referenceId?: string;
  }): Promise<AppNotification> {
    const notif = this.notifRepo.create({
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type || NotificationType.INFO,
      category: data.category || NotificationCategory.GENERAL,
      referenceId: data.referenceId || null,
    });
    const saved = await this.notifRepo.save(notif);
    this.logger.log(`Notificación creada para usuario ${data.userId}: ${data.title}`);
    return saved;
  }

  /** Create notifications for multiple users at once */
  async createForMany(
    userIds: string[],
    data: {
      title: string;
      message: string;
      type?: NotificationType;
      category?: NotificationCategory;
      referenceId?: string;
    },
  ): Promise<AppNotification[]> {
    const notifs = userIds.map(userId =>
      this.notifRepo.create({
        userId,
        title: data.title,
        message: data.message,
        type: data.type || NotificationType.INFO,
        category: data.category || NotificationCategory.GENERAL,
        referenceId: data.referenceId || null,
      }),
    );
    const saved = await this.notifRepo.save(notifs);
    this.logger.log(`Creadas ${saved.length} notificaciones para ${userIds.length} usuarios`);
    return saved;
  }

  /** Get all notifications for a user, ordered by most recent first */
  async findForUser(userId: string, category?: NotificationCategory): Promise<AppNotification[]> {
    const where: any = { userId };
    if (category) {
      where.category = category;
    }
    return this.notifRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  /** Get unread count for a user */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notifRepo.count({
      where: { userId, isRead: false },
    });
  }

  /** Mark a single notification as read */
  async markAsRead(notifId: string, userId: string): Promise<AppNotification | null> {
    const notif = await this.notifRepo.findOne({
      where: { id: notifId, userId },
    });
    if (!notif) return null;
    notif.isRead = true;
    return this.notifRepo.save(notif);
  }

  /** Mark all notifications as read for a user */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notifRepo.update({ userId, isRead: false }, { isRead: true });
    this.logger.log(`Todas las notificaciones marcadas como leídas para usuario ${userId}`);
  }

  /** Mark all notifications of a specific category as read for a user */
  async markByCategoryAsRead(userId: string, category: NotificationCategory): Promise<void> {
    await this.notifRepo.update({ userId, category, isRead: false }, { isRead: true });
    this.logger.log(`Notificaciones de categoría ${category} marcadas como leídas para usuario ${userId}`);
  }

  /** Delete all notifications for a user, optionally filtered by category */
  async deleteForUser(userId: string, category?: NotificationCategory): Promise<number> {
    const where: any = { userId };
    if (category) {
      where.category = category;
    }
    const result = await this.notifRepo.delete(where);
    this.logger.log(`Eliminadas ${result.affected} notificaciones para usuario ${userId}${category ? ' (categoría: ' + category + ')' : ''}`);
    return result.affected || 0;
  }
}
