import { Component, computed, signal } from '@angular/core';

import {
  ADMIN_ASISTENCIAS_DAY_HEADERS,
  ADMIN_ASISTENCIAS_DETAIL_BY_KEY,
  ADMIN_ASISTENCIAS_KPIS,
  ADMIN_ASISTENCIAS_ROWS,
  ADMIN_ASISTENCIAS_WEEK_LABEL,
  adminAsistenciaDetailKey,
  type AdminAsistenciaCell,
  type AdminAsistenciaDetailMock,
} from './admin-asistencias.mock';

type AdminDayHeader = (typeof ADMIN_ASISTENCIAS_DAY_HEADERS)[number];

export interface AdminAsistenciaSelection {
  readonly workerId: string;
  readonly dayIndex: number;
}

@Component({
  selector: 'app-admin-asistencias',
  standalone: true,
  templateUrl: './admin-asistencias.component.html',
})
export class AdminAsistenciasComponent {
  protected readonly kpis = ADMIN_ASISTENCIAS_KPIS;
  protected readonly weekLabel = ADMIN_ASISTENCIAS_WEEK_LABEL;
  protected readonly dayHeaders = ADMIN_ASISTENCIAS_DAY_HEADERS;
  protected readonly rows = ADMIN_ASISTENCIAS_ROWS;

  protected readonly selection = signal<AdminAsistenciaSelection | null>({
    workerId: 'w2',
    dayIndex: 3,
  });

  protected readonly panelDetail = computed((): AdminAsistenciaDetailMock | null => {
    const s = this.selection();
    if (!s) {
      return null;
    }
    return ADMIN_ASISTENCIAS_DETAIL_BY_KEY[adminAsistenciaDetailKey(s.workerId, s.dayIndex)] ?? null;
  });

  protected readonly panelContext = computed(() => {
    const s = this.selection();
    if (!s) {
      return null;
    }
    const row = this.rows.find((r) => r.id === s.workerId);
    const day = this.dayHeaders[s.dayIndex];
    if (!row || !day) {
      return null;
    }
    return { workerName: row.name, dayLabel: day.label };
  });

  protected isCellSelected(workerId: string, dayIndex: number): boolean {
    const s = this.selection();
    return s !== null && s.workerId === workerId && s.dayIndex === dayIndex;
  }

  protected onCellClick(workerId: string, dayIndex: number, cell: AdminAsistenciaCell): void {
    if (cell.kind === 'off') {
      return;
    }
    this.selection.set({ workerId, dayIndex });
  }

  protected cellRingClass(workerId: string, dayIndex: number): boolean {
    return this.isCellSelected(workerId, dayIndex);
  }

  protected onJustificacionOficio(): void {
    return;
  }

  protected onPrevWeek(): void {
    return;
  }

  protected onNextWeek(): void {
    return;
  }

  protected onApproveJustification(): void {
    return;
  }

  protected onRejectJustification(): void {
    return;
  }

  protected onExportReport(): void {
    return;
  }

  protected dayHeaderClass(h: AdminDayHeader): string {
    const base = 'min-w-[4.5rem] p-3 text-center text-[10px] font-bold uppercase';
    const weekend = h.key === 'sat' || h.key === 'sun';
    return weekend
      ? `${base} text-red-800 dark:text-red-300`
      : `${base} text-[#45474d] dark:text-[var(--erp-login-muted)]`;
  }
}
