import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationService, AppNotification } from '../../core/services/notification.service';

@Component({
  selector: 'app-admin-notificaciones',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-notificaciones.component.html',
})
export class AdminNotificacionesComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);

  protected readonly notifications = signal<AppNotification[]>([]);
  protected readonly loading = signal(true);
  protected readonly unreadCount = signal(0);

  // Pagination
  protected readonly pageSize = 5;
  protected readonly currentPage = signal(1);

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.notifications().length / this.pageSize))
  );

  protected readonly paginatedNotifs = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.notifications().slice(start, start + this.pageSize);
  });

  ngOnInit() {
    this.loadNotifications();
  }

  private loadNotifications() {
    this.loading.set(true);
    // Load production-related notifications (both assigned and completed)
    this.notificationService.getMyNotifications().subscribe({
      next: (notifs) => {
        this.notifications.set(notifs);
        this.unreadCount.set(notifs.filter(n => !n.isRead).length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected prodCardClass(n: AppNotification): string {
    const base =
      'rounded-lg bg-white p-5 transition-colors dark:bg-[var(--erp-login-card)] border-l-4 hover:bg-[#f3f4f5] dark:hover:bg-[var(--erp-login-input-bg)]';
    if (n.type === 'SUCCESS') return `${base} border-emerald-500`;
    if (n.type === 'ALERT') return `${base} border-[#fe4b55]`;
    return `${base} border-[#47607e]`;
  }

  protected prodIcon(n: AppNotification): string {
    if (n.category === 'PRODUCTION_COMPLETED') return 'check_circle';
    if (n.category === 'PRODUCTION_ASSIGNED') return 'assignment';
    if (n.category === 'LEAVE_REQUEST') return 'event_note';
    if (n.category === 'ATTENDANCE_INCIDENCE') return 'running_with_errors';
    return 'notifications';
  }

  protected categoryLabel(n: AppNotification): string {
    switch (n.category) {
      case 'PRODUCTION_COMPLETED': return 'Producción terminada';
      case 'PRODUCTION_ASSIGNED': return 'Nueva asignación';
      case 'LEAVE_REQUEST': return 'Permiso / Vacaciones';
      case 'ATTENDANCE_INCIDENCE': return 'Incidencia Asistencia';
      default: return 'Sistema';
    }
  }

  protected prodIconColor(n: AppNotification): string {
    if (n.type === 'SUCCESS') return 'text-emerald-500';
    if (n.type === 'ALERT') return 'text-[#fe4b55]';
    return 'text-[#47607e]';
  }

  protected onMarkAsRead(n: AppNotification) {
    if (n.isRead) return;
    this.notificationService.markAsRead(n.id).subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(item => item.id === n.id ? { ...item, isRead: true } : item)
        );
        this.unreadCount.update(c => Math.max(0, c - 1));
      },
    });
  }

  protected onMarkAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(item => ({ ...item, isRead: true }))
        );
        this.unreadCount.set(0);
      },
    });
  }

  protected onClearAll() {
    this.notificationService.clearNotifications().subscribe({
      next: () => {
        this.notifications.set([]);
        this.unreadCount.set(0);
        this.currentPage.set(1);
      },
    });
  }

  protected goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  protected formatTimeAgo(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Ahora';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `Hace ${diffHrs}h`;
    const diffDays = Math.floor(diffHrs / 24);
    return `Hace ${diffDays}d`;
  }
}
