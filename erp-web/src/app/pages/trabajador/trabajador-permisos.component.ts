import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { SystemParametersApiService } from '../../core/system-parameters/system-parameters-api.service';
import type { HolidayRowDto } from '../../core/system-parameters/system-parameters-api.types';

export type WorkerPermisoHistoryStatus = 'propuesta_admin' | 'aprobado' | 'revision';

export interface WorkerPermisoHistoryItem {
  readonly id: string;
  readonly title: string;
  readonly dateRange: string;
  readonly daysLabel: string;
  readonly status: WorkerPermisoHistoryStatus;
  readonly negotiation?: {
    readonly from: string;
    readonly message: string;
  };
}

@Component({
  selector: 'app-trabajador-permisos',
  standalone: true,
  templateUrl: './trabajador-permisos.component.html',
})
export class TrabajadorPermisosComponent implements OnInit {
  private readonly sysParams = inject(SystemParametersApiService);

  protected readonly balance = {
    availableDays: '—' as const,
    periodLabel: 'Sin datos de periodo',
    requested: 0,
    approved: 0,
  };

  protected readonly history: readonly WorkerPermisoHistoryItem[] = [];

  protected readonly viewDate = signal(new Date());

  protected readonly fullDay = signal(true);

  protected readonly selectionStartMs = signal<number | null>(null);

  protected readonly selectionEndMs = signal<number | null>(null);

  protected readonly holidays = signal<HolidayRowDto[]>([]);

  protected readonly monthTitle = computed(() => {
    const d = this.viewDate();
    const raw = d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  });

  protected readonly selectionReady = computed(() => {
    const a = this.selectionStartMs();
    const b = this.selectionEndMs();
    return a !== null && b !== null;
  });

  protected readonly selectionHint = computed(() => {
    if (this.selectionReady()) {
      return '';
    }
    const s = this.selectionStartMs();
    if (s === null) {
      return 'Pulsa el primer día. Después el último del rango, o vuelve a pulsar el mismo día si solo necesitas uno.';
    }
    return 'Pulsa el último día del rango, o el mismo día otra vez para solicitar un solo día.';
  });

  protected readonly selectionSummary = computed(() => {
    if (!this.selectionReady()) {
      return '';
    }
    const lo = Math.min(this.selectionStartMs()!, this.selectionEndMs()!);
    const hi = Math.max(this.selectionStartMs()!, this.selectionEndMs()!);
    const a = new Date(lo);
    const b = new Date(hi);
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const na = a.toLocaleDateString('es-MX', opts);
    const nb = b.toLocaleDateString('es-MX', opts);
    const days = Math.round((hi - lo) / 86400000) + 1;
    const dayWord = days === 1 ? '1 día' : `${days} días`;
    return na === nb ? `${na} · ${dayWord}` : `${na} — ${nb} · ${dayWord}`;
  });

  protected readonly calendarCells = computed(() => {
    const d = this.viewDate();
    const y = d.getFullYear();
    const m = d.getMonth();
    const first = new Date(y, m, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const s = this.selectionStartMs();
    const e = this.selectionEndMs();
    let lo: number | null = null;
    let hi: number | null = null;
    if (s !== null && e !== null) {
      lo = Math.min(s, e);
      hi = Math.max(s, e);
    } else if (s !== null) {
      lo = s;
      hi = s;
    }

    const currentHolidays = this.holidays();
    // Solo comparar por fecha exacta YYYY-MM-DD para evitar marcas cruzadas entre años.
    const holidayExact = new Set(
      currentHolidays.map((h) => h.date.slice(0, 10)),
    );

    const cells: Array<{
      label: number | null;
      timeMs: number | null;
      inRange: boolean;
      isStart: boolean;
      isEnd: boolean;
      isHoliday: boolean;
      holidayTitle?: string;
    }> = [];

    for (let i = 0; i < startPad; i++) {
      cells.push({
        label: null,
        timeMs: null,
        inRange: false,
        isStart: false,
        isEnd: false,
        isHoliday: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(y, m, day);
      const timeMs = dateObj.getTime();
      const mm = String(m + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      const iso = `${y}-${mm}-${dd}`;

      const hInfo = currentHolidays.find(h => h.date.slice(0, 10) === iso);
      const isHoliday = !!hInfo;

      let inRange = false;
      let isStart = false;
      let isEnd = false;
      if (lo !== null && hi !== null) {
        isStart = timeMs === lo;
        isEnd = timeMs === hi;
        if (lo < hi) {
          inRange = timeMs > lo && timeMs < hi;
        }
      }
      cells.push({
        label: day,
        timeMs,
        inRange,
        isStart,
        isEnd,
        isHoliday,
        holidayTitle: hInfo?.title,
      });
    }

    while (cells.length % 7 !== 0) {
      cells.push({
        label: null,
        timeMs: null,
        inRange: false,
        isStart: false,
        isEnd: false,
        isHoliday: false,
      });
    }

    return cells;
  });

  protected readonly weekdayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const;

  ngOnInit(): void {
    this.sysParams.get().subscribe({
      next: (snap) => {
        this.holidays.set(snap.holidays);
      },
      error: (err) => console.error('Error al cargar parámetros del sistema', err),
    });
  }

  protected prevMonth(): void {
    const d = new Date(this.viewDate());
    d.setMonth(d.getMonth() - 1);
    this.viewDate.set(d);
  }

  protected nextMonth(): void {
    const d = new Date(this.viewDate());
    d.setMonth(d.getMonth() + 1);
    this.viewDate.set(d);
  }

  protected toggleFullDay(): void {
    this.fullDay.update((v) => !v);
  }

  protected clearSelection(): void {
    this.selectionStartMs.set(null);
    this.selectionEndMs.set(null);
  }

  protected onDayClick(day: number): void {
    const v = this.viewDate();
    const y = v.getFullYear();
    const m = v.getMonth();
    const t = new Date(y, m, day).getTime();

    const s = this.selectionStartMs();
    const e = this.selectionEndMs();

    if (s !== null && e !== null) {
      this.selectionStartMs.set(t);
      this.selectionEndMs.set(null);
      return;
    }

    if (s === null) {
      this.selectionStartMs.set(t);
      this.selectionEndMs.set(null);
      return;
    }

    if (t === s) {
      this.selectionEndMs.set(t);
      return;
    }

    if (t < s) {
      this.selectionEndMs.set(s);
      this.selectionStartMs.set(t);
    } else {
      this.selectionEndMs.set(t);
    }
  }

  protected cellAriaLabel(c: {
    label: number | null;
    isStart: boolean;
    isEnd: boolean;
    inRange: boolean;
    isHoliday: boolean;
    holidayTitle?: string;
  }): string {
    if (c.label === null) {
      return '';
    }
    const parts: string[] = [`Día ${c.label}`];
    if (c.isHoliday) {
      parts.push(`No laborable: ${c.holidayTitle}`);
    }
    if (c.isStart && c.isEnd) {
      parts.push('seleccionado');
    } else if (c.isStart) {
      parts.push('inicio del rango');
    } else if (c.isEnd) {
      parts.push('fin del rango');
    } else if (c.inRange) {
      parts.push('dentro del rango');
    }
    return parts.join(', ');
  }

  protected onSendRequest(): void {
    return;
  }

  protected onAcceptProposal(_item: WorkerPermisoHistoryItem): void {
    return;
  }

  protected onRejectProposal(_item: WorkerPermisoHistoryItem): void {
    return;
  }

  protected statusBadgeClass(status: WorkerPermisoHistoryStatus): string {
    if (status === 'propuesta_admin') {
      return 'erp-permisos-badge erp-permisos-badge--propuesta';
    }
    if (status === 'aprobado') {
      return 'erp-permisos-badge erp-permisos-badge--aprobado';
    }
    return 'erp-permisos-badge erp-permisos-badge--revision';
  }

  protected statusLabel(status: WorkerPermisoHistoryStatus): string {
    if (status === 'propuesta_admin') {
      return 'Propuesta admin';
    }
    if (status === 'aprobado') {
      return 'Aprobado';
    }
    return 'En revisión';
  }
}
