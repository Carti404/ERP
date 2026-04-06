import { DatePipe } from '@angular/common';
import { afterNextRender, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

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

  protected readonly inbox: readonly { id: string; initials: string; from: string; time: string; preview: string; dimmed?: boolean }[] =
    [];

  protected readonly hasUrgentAlert = false;

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
    });
  }

  protected onQuickAction(action: 'check_in' | 'break_start' | 'break_end' | 'check_out'): void {
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
        this.clockFaceState.set(this.clockFaceBeforeBreak === 'break' ? 'default' : this.clockFaceBeforeBreak);
        this.showToast('Regreso de descanso registrado.', 'success');
        break;
      case 'check_out':
        this.clockFaceState.set('ended');
        this.showToast('Salida de turno registrada.', 'error');
        break;
      default:
        break;
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
