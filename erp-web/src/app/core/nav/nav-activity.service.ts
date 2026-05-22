import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { MessagesApiService } from '../messages/messages-api.service';

@Injectable({ providedIn: 'root' })
export class NavActivityService implements OnDestroy {
  private readonly notifications = inject(NotificationService);
  private readonly messages = inject(MessagesApiService);

  private pollingSub?: Subscription;

  readonly notificationsUnread = signal(0);
  readonly inboxUnread = signal(0);
  readonly attendanceUnread = signal(0);

  startPolling(intervalMs = 15_000): void {
    this.refresh();
    this.pollingSub?.unsubscribe();
    this.pollingSub = timer(0, intervalMs).subscribe(() => this.refresh());
  }

  refresh(): void {
    this.notifications.getUnreadCount().subscribe({
      next: (r) => this.notificationsUnread.set(r.count),
      error: () => this.notificationsUnread.set(0),
    });

    this.messages.list('inbox').subscribe({
      next: (rows) => this.inboxUnread.set(rows.filter((r) => !r.read).length),
      error: () => this.inboxUnread.set(0),
    });

    this.notifications.getMyNotifications('ATTENDANCE_INCIDENCE').subscribe({
      next: (list) => this.attendanceUnread.set(list.filter((n) => !n.isRead).length),
      error: () => this.attendanceUnread.set(0),
    });
  }

  ngOnDestroy(): void {
    this.pollingSub?.unsubscribe();
  }
}
