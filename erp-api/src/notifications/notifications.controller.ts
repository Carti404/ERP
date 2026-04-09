import { Controller, Get, Patch, Param, Post, Delete, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { NotificationCategory } from './entities/notification.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /** Get notifications for the current user, optionally filtered by category */
  @Get()
  async getMyNotifications(
    @CurrentUser() user: any,
    @Query('category') category?: NotificationCategory,
  ) {
    return this.notificationsService.findForUser(user.userId, category);
  }

  /** Get unread count */
  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: any) {
    const count = await this.notificationsService.getUnreadCount(user.userId);
    return { count };
  }

  /** Mark a single notification as read */
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notificationsService.markAsRead(id, user.userId);
  }

  /** Mark all notifications as read */
  @Post('mark-all-read')
  async markAllAsRead(@CurrentUser() user: any) {
    await this.notificationsService.markAllAsRead(user.userId);
    return { success: true };
  }

  /** Delete/clear notifications for the current user, optionally filtered by category */
  @Delete()
  async clearNotifications(
    @CurrentUser() user: any,
    @Query('category') category?: NotificationCategory,
  ) {
    const affected = await this.notificationsService.deleteForUser(user.userId, category);
    return { success: true, affected };
  }
}
