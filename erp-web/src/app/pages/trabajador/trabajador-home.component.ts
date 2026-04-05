import { DatePipe } from '@angular/common';
import { afterNextRender, Component, computed, DestroyRef, inject, signal } from '@angular/core';

/** Color de los dígitos del reloj según acción de checador. */
export type WorkerClockFaceState = 'default' | 'working' | 'break' | 'ended';

type WorkerToastVariant = 'success' | 'warning' | 'error';

interface WorkerToastPayload {
  readonly id: number;
  readonly message: string;
  readonly variant: WorkerToastVariant;
}

import { KpiMiniChartComponent } from '../../shared/kpi-mini-chart.component';
import { KPI_TONE_HEX } from '../../shared/kpi/kpi-tone';
import type { KpiTone } from '../../shared/kpi/kpi-tone';
import {
  WORKER_EVENTS_MOCK,
  WORKER_INBOX_MOCK,
  WORKER_KPIS_MOCK,
  type WorkerKpiMock,
} from './trabajador-home.mock';

@Component({
  selector: 'app-trabajador-home',
  standalone: true,
  imports: [DatePipe, KpiMiniChartComponent],
  templateUrl: './trabajador-home.component.html',
})
export class TrabajadorHomeComponent {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly kpis = WORKER_KPIS_MOCK;
  protected readonly inbox = WORKER_INBOX_MOCK;
  protected readonly urgentTitle = 'Alertas urgentes';
  protected readonly urgentBadge = '1 crítica';
  protected readonly urgentBody =
    'CALIBRACIÓN — Desviación del sensor superior al 5% en unidad de soldadura B-02. Mantenimiento notificado.';
  protected readonly events = WORKER_EVENTS_MOCK;

  protected readonly batchProgress = 0.72;
  /** Radio del anillo de avance (compacto). */
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

  /** Color del reloj antes de iniciar descanso (para volver a la “normalidad” al regresar). */
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

  protected toneHex(tone: KpiTone): string {
    return KPI_TONE_HEX[tone];
  }

  protected kpiIcon(id: string): string {
    switch (id) {
      case 'oee':
        return 'speed';
      case 'takt':
        return 'timer';
      case 'units':
        return 'check_circle';
      case 'scrap':
        return 'recycling';
      default:
        return 'analytics';
    }
  }

  protected trendIcon(t: WorkerKpiMock['trend']): string {
    if (t === 'up') {
      return 'trending_up';
    }
    if (t === 'down') {
      return 'trending_down';
    }
    return 'remove';
  }

  protected trendLabel(t: WorkerKpiMock['trend']): string {
    if (t === 'up') {
      return 'Favorable';
    }
    if (t === 'down') {
      return 'A mejorar';
    }
    return 'Estable';
  }

  protected trendClass(t: WorkerKpiMock['trend']): string {
    const base = 'erp-trend';
    if (t === 'up') {
      return `${base} erp-trend--up`;
    }
    if (t === 'down') {
      return `${base} erp-trend--down`;
    }
    return `${base} erp-trend--neutral`;
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
