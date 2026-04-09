import { DatePipe } from '@angular/common';
import { afterNextRender, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AttendanceService } from '../../core/http/attendance.service';
import { MessagesApiService } from '../../core/messages/messages-api.service';
import { NotificationService, AppNotification } from '../../core/services/notification.service';

/** Color de los dígitos del reloj según acción de checador. */
export type WorkerClockFaceState = 'default' | 'working' | 'break' | 'ended';

type WorkerToastVariant = 'success' | 'warning' | 'error';

interface WorkerToastPayload {
  readonly id: number;
  readonly message: string;
  readonly variant: WorkerToastVariant;
}

@Component({
  selector: 'app-trabajador-home',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './trabajador-home.component.html',
})
export class TrabajadorHomeComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly attendanceService = inject(AttendanceService);
  private readonly messagesApi = inject(MessagesApiService);
  private readonly notificationService = inject(NotificationService);

  protected inbox: {
    id: string;
    initials: string;
    from: string;
    time: string;
    preview: string;
    dimmed?: boolean;
    importance: string;
  }[] = [];

  protected unreadCount = 0;

  // Order alerts from notifications API
  protected readonly orderAlerts = signal<AppNotification[]>([]);
  protected readonly hasUrgentAlert = computed(() => this.orderAlerts().length > 0);

  protected readonly events: readonly {
    id: string;
    type: string;
    typeIcon: string;
    description: string;
    time: string;
    status: string;
    statusVariant: 'dark' | 'secondary' | 'success';
  }[] = [];

  protected readonly hasActiveBatch = false;

  protected readonly batchProgress = 0;

  protected readonly progressRadius = 52;
  protected readonly progressCircumference = 2 * Math.PI * this.progressRadius;
  protected readonly progressDashOffset = computed(
    () => this.progressCircumference * (1 - this.batchProgress),
  );

  protected readonly clock = signal(new Date());

  protected readonly clockFaceState = signal<WorkerClockFaceState>('default');

  protected readonly toast = signal<WorkerToastPayload | null>(null);

  private toastSeq = 0;

  private pendingToastClear: ReturnType<typeof globalThis.setTimeout> | null = null;

  private clockFaceBeforeBreak: WorkerClockFaceState = 'default';

  constructor() {
    afterNextRender(() => {
      const id = globalThis.setInterval(() => this.clock.set(new Date()), 1000);
      this.destroyRef.onDestroy(() => {
        globalThis.clearInterval(id);
        if (this.pendingToastClear !== null) {
          globalThis.clearTimeout(this.pendingToastClear);
        }
      });
      this.loadTodayStatus();
      this.loadInbox();
      this.loadOrderAlerts();
    });
  }

  private loadTodayStatus(): void {
    this.attendanceService.getTodayStatus().subscribe({
      next: (record) => {
        if (!record || !record.logs || record.logs.length === 0) {
          this.clockFaceState.set('default');
          return;
        }

        const logs = record.logs.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );
        const lastLog = logs[logs.length - 1];

        if (
          lastLog.eventType === 'CLOCK_IN' ||
          lastLog.eventType === 'BREAK_END' ||
          lastLog.eventType === 'MEAL_END'
        ) {
          this.clockFaceState.set('working');
        } else if (lastLog.eventType === 'BREAK_START' || lastLog.eventType === 'MEAL_START') {
          this.clockFaceState.set('break');
        } else if (lastLog.eventType === 'CLOCK_OUT') {
          this.clockFaceState.set('ended');
        }
      },
      error: () => this.showToast('No se pudo cargar el estatus de asistencia', 'error'),
    });
  }

  private loadInbox(): void {
    this.messagesApi.list('inbox').subscribe({
      next: (rows) => {
        const unread = rows.filter((r) => !r.read);
        this.unreadCount = unread.length;

        const pScores: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        unread.sort((a, b) => {
          const sA = pScores[a.importance] || 0;
          const sB = pScores[b.importance] || 0;
          if (sA !== sB) return sB - sA;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        this.inbox = unread.slice(0, 3).map((r) => ({
          id: r.id,
          initials: r.sender.fullName.substring(0, 2).toUpperCase(),
          from: r.sender.fullName,
          time: new Date(r.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          preview: r.subject,
          dimmed: false,
          importance: (r.importance || 'LOW').toLowerCase(),
        }));
      },
    });
  }

  private loadOrderAlerts(): void {
    this.notificationService.getMyNotifications('PRODUCTION_ASSIGNED').subscribe({
      next: (notifs) => {
        // Show only unread production assignment notifications, limit to 3 (like inbox)
        const unread = notifs.filter(n => !n.isRead);
        this.orderAlerts.set(unread.slice(0, 3));
      },
      error: () => {
        // Silently fail — alert section will just show "no alerts"
      },
    });
  }

  protected onClearAlerts(): void {
    this.notificationService.clearNotifications('PRODUCTION_ASSIGNED').subscribe({
      next: () => {
        this.orderAlerts.set([]);
      },
    });
  }

  protected formatAlertTime(dateStr: string): string {
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

  protected onMarkAlertRead(alert: AppNotification) {
    this.notificationService.markAsRead(alert.id).subscribe({
      next: () => {
        this.orderAlerts.update(list =>
          list.map(a => a.id === alert.id ? { ...a, isRead: true } : a)
        );
      },
    });
  }

  protected onQuickAction(action: 'check_in' | 'break_start' | 'break_end' | 'check_out'): void {
    const apiAction = this.mapActionToApi(action);
    this.attendanceService.registerEvent(apiAction).subscribe({
      next: () => {
        switch (action) {
          case 'check_in':
            this.clockFaceState.set('working');
            this.showToast('Entrada de turno registrada.', 'success');
            break;
          case 'break_start':
            this.clockFaceBeforeBreak = this.clockFaceState();
            this.clockFaceState.set('break');
            this.showToast('Inicio de descanso registrado.', 'warning');
            break;
          case 'break_end':
            this.clockFaceState.set(
              this.clockFaceBeforeBreak === 'break' ? 'working' : this.clockFaceBeforeBreak,
            );
            this.showToast('Regreso de descanso registrado.', 'success');
            break;
          case 'check_out':
            this.clockFaceState.set('ended');
            this.showToast('Salida de turno registrada.', 'error');
            break;
        }
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Error al registrar evento', 'error');
      },
    });
  }

  private mapActionToApi(action: string): string {
    switch (action) {
      case 'check_in':
        return 'CLOCK_IN';
      case 'check_out':
        return 'CLOCK_OUT';
      case 'break_start':
        return 'BREAK_START';
      case 'break_end':
        return 'BREAK_END';
      default:
        return 'CLOCK_IN';
    }
  }

  protected toastIcon(variant: WorkerToastVariant): string {
    if (variant === 'success') {
      return 'check_circle';
    }
    if (variant === 'warning') {
      return 'schedule';
    }
    return 'logout';
  }

  protected onReportIssue(): void {
    return;
  }

  private showToast(message: string, variant: WorkerToastVariant): void {
    if (this.pendingToastClear !== null) {
      globalThis.clearTimeout(this.pendingToastClear);
      this.pendingToastClear = null;
    }
    const id = ++this.toastSeq;
    this.toast.set({ id, message, variant });
    this.pendingToastClear = globalThis.setTimeout(() => {
      this.pendingToastClear = null;
      this.toast.update((cur) => (cur?.id === id ? null : cur));
    }, 3800);
  }
}
